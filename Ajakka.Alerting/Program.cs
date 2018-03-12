﻿using System;

namespace Ajakka.Alerting
{
    class Program
    {
        static void Main(string[] args)
        {
            var actionStore = ActionStoreFactory.GetActionStore();
            var config = new AlertingConfiguration();

            Console.WriteLine("MessageQueueHost: " + config.MessageQueueHost);
            Console.WriteLine("DALServerRpcQueueName: " + config.CommandProcessorRpcQueueName);
            
            using(var cmdProcessor = new CommandProcessor(config, actionStore)){
                cmdProcessor.Start();
                Console.WriteLine("CommandProcessor started");
                
                Console.WriteLine(" Press [enter] to exit.");
                Console.ReadLine();
            }
        }
    }
}
