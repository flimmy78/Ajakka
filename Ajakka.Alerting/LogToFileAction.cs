using System;
using System.IO;
using System.Runtime.Serialization;
using Ajakka.Alerting.Descriptors;

namespace Ajakka.Alerting{
    [DataContract]
    [DisplayName("Log to file")]
    public class LogToFileAction : AlertActionBase
    {
        public LogToFileAction(){
            TimestampFormat = "G";
        }

        [DataMember]
        [DisplayName("File name")]
        [PropertyType("text")]
        [IsRequired(true)]
        public string FileName{get;set;}
         
        [DataMember]
        [DisplayName("Timestamp format")]
        [PropertyType("text")]
        [PropertyHint("Date and time formatting string. Click to get more help.","http://www.csharp-examples.net/string-format-datetime/")]
        public string TimestampFormat {get;set;}

        public override object Clone()
        {
            return new LogToFileAction{
                Configuration = this.Configuration,
                Name = this.Name,
                FileName = this.FileName,
                Id = Id
            };
        }

        public override void Execute(dynamic data){
            var alertMessage = GetAlertMessage(data);
            try{
                using(var writer = new StreamWriter(FileName, true)){
                    writer.WriteLine(DateTime.Now.ToString(TimestampFormat) + " : " + alertMessage);
                }
            }
            catch(Exception ex){
                Console.WriteLine("Could not log to file: " + ex);
            }
        }

        public override void Initialize()
        {
            if(string.IsNullOrEmpty(Configuration))
                return;
            
            var config = ParseConfiguration(new {TimestampFormat = "", FileName = ""});
          
            TimestampFormat = config.TimestampFormat;
            FileName = Path.GetFileName(config.FileName);
            if(string.IsNullOrEmpty(FileName)){
                throw new InvalidOperationException("FileName property is not set");
            }
        }
    }
}