using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;
using System.Net.NetworkInformation;
using Ajakka.Net;
using RabbitMQ.Client;
using System.IO;
using System.Runtime.Serialization.Json;
using Newtonsoft.Json;

namespace Ajakka.Sensor{
    class DhcpSensor{

        bool stop = false;
        SensorConfiguration configuration;

        public DhcpSensor(SensorConfiguration configuration){
            bool valid = ValidateAndLogConfiguration(configuration);
            if(!valid){
                Console.WriteLine("Configuration is not valid. Sensor cannot start.");
                return;
            }
            this.configuration = configuration;
            Task.Run(()=>{
                SensorLoop();
            });
        }

        public void Stop()
        {
            stop = true;
        }

        private bool ValidateAndLogConfiguration(SensorConfiguration configuration){
           
            Console.WriteLine("messageQueueExchangeName: " + configuration.MessageQueueExchangeName);

            Console.WriteLine("messageQueueHost: " + configuration.MessageQueueHost);
            if(string.IsNullOrEmpty(configuration.MessageQueueHost))
            {
                Console.WriteLine("messageQueueHost address empty, using localhost");
            }
            Console.WriteLine("enableMessaging: " + configuration.EnableMessaging);
            return true;
        }

        private async void SensorLoop(){
            try{
                
                using (var udpClient = new UdpClient(new IPEndPoint(0,67))){
                    
                    udpClient.EnableBroadcast = true;
                    Console.WriteLine("Starting to listen on " + udpClient.Client.LocalEndPoint);
                    while (!stop)
                    {
                        var receivedResults = await udpClient.ReceiveAsync();
                        var packet = new Ajakka.Net.DhcpPacket(receivedResults.Buffer);
                        Console.WriteLine("Received packet. Actual DHCP: " + packet.IsActualDhcp);
                        Console.WriteLine("MAC: " + packet.GetClientMac());
                        Console.WriteLine("Hostname: " + packet.GetHostName());
                        if(configuration.EnableMessaging)
                        {
                            var task = Task.Run(()=>{SendNotification(packet);});
                        }
                    }
                }
            }
            catch(Exception ex){
                Console.WriteLine(ex);
            }
        }

        private void SendNotification(DhcpPacket packet)
        {
            var factory = new ConnectionFactory() { 
                HostName = string.IsNullOrEmpty(configuration.MessageQueueHost) ? 
                    "localhost" :
                    configuration.MessageQueueHost,
                    UserName = configuration.MessageQueueUserName,
                    Password = configuration.MessageQueuePassword
            };
            using(var connection = factory.CreateConnection()){
                using(var channel = connection.CreateModel())
                {
                    channel.ExchangeDeclare(exchange: configuration.MessageQueueExchangeName, type: "fanout");
                    
                    string message = BuildMessage(packet);
                    var body = Encoding.UTF8.GetBytes(message);

                    channel.BasicPublish(exchange: string.IsNullOrEmpty(configuration.MessageQueueExchangeName) ? "": configuration.MessageQueueExchangeName,
                                        routingKey: "",
                                        basicProperties: null,
                                        body: body);
                }
            }
        }

        private string BuildMessage(DhcpPacket packet)
        {
            var deviceName = packet.GetHostName();
            var ip = packet.GetClientIp();
            var mac = packet.GetClientMac();

            var message = new 
            {
                DeviceName = deviceName,
                DeviceIpAddress = ip == null ? string.Empty: ip.ToString(),
                DeviceMacAddress = mac == null ? string.Empty : mac.ToString(),
                TimeStamp = DateTime.UtcNow,
                DetectedBy = configuration.SensorName
            };
            return JsonConvert.SerializeObject(message); 
        }



    }
}