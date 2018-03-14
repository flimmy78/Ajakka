function loadRules(){
    var currentPage = $('#currentPage').text();
    if(!currentPage){
        currentPage = 0;
    }

    $.get({
        url: '/api/blacklist/page/'+currentPage,
        success: fillTableWithRules,
        error:showError
      });
    $.get({
        url:'/api/blacklist/pageCount',
        success:showPageCount
    })
} 

function showPageCount(pageCountResponse){
    $('#pageCount').text('');
    var pageCount = pageCountResponse.Content;
    var currentPage = $('#currentPage').text();
    if(!currentPage){
        currentPage = 0;
    }
    
    if(currentPage > 0){
        var previousPage = currentPage - 1;
        $('#pageCount').append('<a href="/settings/alerts?page='+previousPage+'"><i class="fas fa-caret-left"> ');    
    }
    currentPage++;
    $('#pageCount').append(' ' + currentPage + '/' + pageCount);

    if(currentPage < pageCount){
        var nextPage = currentPage;
        $('#pageCount').append('<a href="/settings/alerts?page='+nextPage+'"> <i class="fas fa-caret-right"> ');    
    }
}

function showError(error){
    console.log(error);
    $('#ruleListContainer').empty();
    $('#ruleListContainer').append('<tr class="table-danger"><td colspan="4">Request error: '+error.statusText+'</td></tr>');
}

function fillTableWithRules(rules){
    $('#ruleListContainer').empty();

    rules.Content.forEach(function(rule){
        var activeAlerting = 'yes';
        if(rule.AlertActionIds.length == 0){
            activeAlerting = 'no';
        }
        var row = '<tr>';
        row += '<td>' + rule.Name + '</td>';
        row += '<td>' + rule.Pattern + '</td>';
        row += '<td>' + activeAlerting + '</td>';
        row += '<td style="text-align:right"> <button class="btn btn-secondary" onclick="configureAlerts(\''+rule.Id+'\')"><span data-toggle="tooltip" title="Edit"><i class="fas fa-edit"/><span></button> <button class="btn btn-secondary" href="#" onclick="deleteRule(\''+rule.Id+'\',\''+rule.Name+'\')"><span data-toggle="tooltip" title="Delete Rule"><i class="fas fa-trash-alt"/> </span></a></td>';
        row += '</tr>';
        $('#ruleListContainer').append(row);
        
    });
    $('[data-toggle="tooltip"]').tooltip()
}

function deleteRule(id){
    
    $.get({
        method:'DELETE',
        url: '/api/blacklist/'+id,
        success: loadRules,
        error:showError
      });
}

function toggleAddRuleForm(){
    $('#addNewRule').toggle();
    $('#addNewButton').toggle();
}

function addNewRule(){
    $('#newUserName').removeClass('is-invalid');
    $('#password').removeClass('is-invalid');
    $('#passwordRepeat').removeClass('is-invalid');
    $('#addNewUserError').hide();

    var name = $('#newUserName').val();
    if(name == '' || name == null){
        $('#newUserName').addClass('is-invalid');
        return false;
    }
    var password = $('#password').val();
    if(password == '' || password == null){
        $('#password').addClass('is-invalid');
        return false;
    }
    var passwordRepeat = $('#passwordRepeat').val();
    if(password != passwordRepeat){
        $('#passwordRepeat').addClass('is-invalid');
        return false;
    }
    
    var post = new Promise(function(resolve, reject){
        $.post({
            url: '/api/users/',
            data:{name:name, pwd:password},
            dataType:'json',
            success: resolve,
            error:reject
        });
    });
    post.then(function(result){
        $('#addNewUser').hide();
        $('#addNewButton').show();  
        loadUsers(); 
    }).catch(function(error){
        showUserCreationError(error);
        
    });
}

function showUserCreationError(error){
    console.log(error);
    $('#addNewRuleError').text(error.responseText);
    $('#addNewRuleError').show();
}

function configureAlerts(ruleId){
    window.location.href='/settings/alerts/configure/' + ruleId;
}

setTimeout(loadRules, 100);