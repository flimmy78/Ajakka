var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
var configuration = require('../config/ajakkaConfiguration');
var messaging = require('../modules/messaging');


router.get('/pageCount', function (req, res) {
    messaging.SendMessageToQueue(res, '{"FunctionName": "GetPageCount"}', configuration.alertingRpcQueue);
    
});

router.get('/actionTypes', function (req, res) {
    messaging.SendMessageToQueue(res, '{"FunctionName": "GetActionTypes"}', configuration.alertingRpcQueue);
    
});

router.get('/page/:pageId', function (req, res) {
    var pageId = req.params.pageId;
    messaging.SendMessageToQueue(res, '{"FunctionName": "GetActions","PageNumber":'+pageId+'}', configuration.alertingRpcQueue);
    
});

router.get('/:id', function (req, res) {
    var id = req.params.id;
    if(!id){
        res.status(500).send( {Message:"No id specified"});
        return;
    }
    messaging.SendMessageToQueue(res, '{"FunctionName": "GetAction","ActionId":'+id+'}', configuration.alertingRpcQueue);
    
});

router.get('/linkedActions/:ruleId', function(req,res){
    var ruleId = req.params.ruleId;
    if(!ruleId){
        res.status(500).send({Message:"No ruleId specified."});
        return;
    }
    messaging.SendMessageToQueue(res, '{"FunctionName":"GetLinkedActions","RuleId":"'+ruleId+'"}', configuration.alertingRpcQueue);
});

//add action: name, configuration, type
router.post('/', function (req, res) {
    var name = req.body.name;
    if(!name){
        res.status(500).send( {Message:'"name" is required'});
        return;
    }
    var actionConfig = req.body.configuration;
    if(!actionConfig){
        actionConfig = '';
    }
    console.log('Action Configuration: ' + actionConfig);
    var actionType = req.body.type;
    if(!actionType){
        res.status(500).send( {Message:'"type" is required'});
        return;
    }
    messaging.SendMessageToQueue(res, '{"FunctionName": "AddAction","ActionName":"'+name+'","ActionConfiguration":"'+actionConfig+'","ActionType":"'+actionType+'"}', configuration.alertingRpcQueue);
    
});

//update action: name, configuration, type
router.put('/', function (req, res) {
    var name = req.body.name;
    if(!name){
        res.status(500).send( {Message:'"name" is required'});
        return;
    }
    var actionConfig = req.body.configuration;
    if(!actionConfig){
        actionConfig = '';
    }
    var actionType = req.body.type;
    if(!actionType){
        res.status(500).send( {Message:'"type" is required'});
        return;
    }
    var actionId = req.body.actionId;
    if(!actionId){
        res.status(500).send( {Message:'"actionId" is required'});
        return;
    }
    messaging.SendMessageToQueue(res, '{"FunctionName": "UpdateAction","ActionName":"'+name+'","ActionConfiguration":"'+actionConfig+'","ActionType":"'+actionType+'","ActionId":'+actionId+'}', configuration.alertingRpcQueue);
    
});


//links action id to rule
router.put('/linkaction/:ruleId/:actionId', function (req, res) {
    var ruleId = req.params.ruleId;
    var actionId = req.params.actionId;

    if(!ruleId){
        res.status(500).send( {Message:"ruleId cannot be empty"});
        return;
    }
    if(!actionId){
        res.status(500).send( {Message:"actionId cannot be empty"});
        return;
    }

    messaging.SendMessageToQueue(res, '{"FunctionName":"LinkRuleToAction","RuleId":"'+ruleId+'","ActionId":'+actionId+'}', configuration.alertingRpcQueue);
});

module.exports = router;