namespace Ajakka.Blacklist{
    public interface IBlacklistConfiguration{
        string MessageQueueHost {get;}
       
        string MessageQueueExchangeName {get;}

        string CommandProcessorRpcQueueName{get;}

        string AlertingEventQueueName{get;}

        string MessageQueueUserName {get;}

        string MessageQueuePassword {get;}
    }
}