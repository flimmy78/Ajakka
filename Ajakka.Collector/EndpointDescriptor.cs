using System;
using System.Runtime.Serialization;

namespace Ajakka.Collector{
    [DataContract]
    public class EndpointDescriptor{
        
        [DataMember]
        public string DeviceName;

        [DataMember]
        public string DeviceMacAddress;

        [DataMember]
        public string DeviceIpAddress;

        [DataMember]
        public DateTime TimeStamp;

        [DataMember]
        public string VendorName;

        [DataMember]
        public string DetectedBy;
    }
}