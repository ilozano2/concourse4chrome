var State = {
  steps: document.querySelectorAll('.build-step')
};

_tryInit();



function _pauseVisibleJobs() {
  document.querySelectorAll('.node.job').forEach((key) => { 
    var token=localStorage.getItem('csrf_token').replaceAll("\"", "");    
        console.log(key.textContent); 
        var tryout = new XMLHttpRequest();
    
    tryout.open("PUT", '/api/v1' + window.location.pathname + '/jobs/' + key.textContent + '/pause' + window.location.search);
    tryout.withCredentials = true;
    tryout.setRequestHeader("x-csrf-token", token);
    tryout.send()
    });
}

function _addPauseVisibleJobsButton() {
  if(document.querySelector('.node.job') && !document.querySelector('#pause-button')) {
    const pauseButton = document.createElement("div")
    pauseButton.id="pause-button";
    pauseButton.style='border-left: 1px solid rgb(61, 60, 60); background-color: rgb(21, 21, 21); width: 40px; padding-top: 20px; padding-left: 25px;cursor: pointer;';
    pauseButton.textContent='🪂';

    document.querySelector('#top-bar-app').insertAdjacentElement("beforeend", pauseButton);
    pauseButton.onclick = function(ev) {
      _pauseVisibleJobs();
    }
  }
}

function _unpauseVisibleJobs() {
  document.querySelectorAll('.node.job').forEach((key) => { 
    var token=localStorage.getItem('csrf_token').replaceAll("\"", "");    
        console.log(key.textContent); 
        var tryout = new XMLHttpRequest();
    
    tryout.open("PUT", '/api/v1' + window.location.pathname + '/jobs/' + key.textContent + '/unpause' + window.location.search);
    tryout.withCredentials = true;
    tryout.setRequestHeader("x-csrf-token", token);
    tryout.send()
    });
}

function _addUnPauseVisibleJobsButton() {
  if(document.querySelector('.node.job') && !document.querySelector('#unpause-button')) {
    const unpauseButton = document.createElement("div");
    unpauseButton.id="unpause-button";
    unpauseButton.style='border-left: 1px solid rgb(61, 60, 60); background-color: greenyellow; width: 40px; padding-top: 20px; padding-left: 25px;cursor: pointer;';
    unpauseButton.textContent='🪂';

    document.querySelector('#top-bar-app').insertAdjacentElement("beforeend", unpauseButton);
    unpauseButton.onclick = function(ev) {
      _unpauseVisibleJobs();
    }
  }
}

function _initConcourseExtension() {
  console.log('Starting Concourse extension');

  var targetGroup = _findInstanceGroupName();
  var pipelineName = _findPipelineName();
  var varsList = _findListOfVars();
  var jobName = _findJobName();
  var buildNumber = _findBuildNumber();
  // XXX var buildId = _findBuildId();
  
  var flyCmd = _buildCommand(targetGroup, pipelineName, varsList, jobName, buildNumber);
  console.log(flyCmd);
  
  _addPauseVisibleJobsButton();
  _addUnPauseVisibleJobsButton();
  _addCommandToSteps(flyCmd);
}

/*
 * NOTE: This is a simple workaround to run and re-try extension if the page is not loaded yet.
 */
function _tryInit() {
  setTimeout(function() {
    var isLoading = _isLoading();
    
    if (isLoading) {
      _tryInit();
    } else {
      _initConcourseExtension();
      setTimeout(function () {
        _tryInit();
      }, 2000);
    }
  }, 5000);
}

/*******************************************/
/********** Auxiliary functions ************/
/*******************************************/

function _areNewStepsAdded() {
  var oldSteps = State.steps;
  State.steps = document.querySelectorAll('.build-step');

  return State.steps.length > oldSteps.length;
}

function _isLoading() {
  const headers = document.querySelectorAll('.build-step .header:not(.loading-header)');
  return !headers;
}

function _findInstanceGroupName() {
  var path = window.location.pathname;
  var groupNameMatch = path.match(/\/teams\/([^\/]+)\/.*/);

  return groupNameMatch && groupNameMatch.length > 1 ? groupNameMatch[1] : 'your-target-group';
}

function _findPipelineName() {
  var pipelineElement = document.querySelector('a#breadcrumb-pipeline');

  var pipelineName;
  if (pipelineElement) {
    pipelineName = decodeURI(pipelineElement.href).replaceAll(/^.*pipelines\//g,'').replaceAll(/\?.*$/g, '');
  }

  return pipelineName;
}

function _findListOfVars() {
  var pipelineElement = document.querySelector('a#breadcrumb-pipeline')
  var varsList = [];
  if (pipelineElement) {
    var pipelineUri = decodeURI(pipelineElement.href).replaceAll(/.*\?/g, '')
    pipelineName = decodeURI(pipelineElement.href).replaceAll(/^.*pipelines\//g,'').replaceAll(/\?.*$/g, '');
    var vars = pipelineUri.search('&') == -1 ? [] : pipelineUri.split('&');
    for (i in vars) {
      if (vars[i]) {
        var varName = vars[i].replaceAll('vars.', '').replaceAll(/=.*$/g, '');
        var varValue = vars[i].replaceAll('vars.', '').replaceAll(/^.*=/g, '').replaceAll("\"", '');
  
        varsList.push(varName + ':' + varValue);
      }
    }
  }

  return varsList;
}

function _findJobName() {
  var jobElement = document.querySelector('.build-name');
  if (jobElement) {
    var jobName = jobElement.textContent;
  }
  return jobName;
}

function _findBuildNumber() {
  var buildNumber;
  
  var buildsElement = document.querySelector('#builds')
  if (buildsElement && buildsElement.children && buildsElement.children.length > 0) {
    buildNumber = buildsElement.children[0].textContent;
  }

  return buildNumber;
}

function _findBuildId() {
  var buildId;
  var buildsElement = document.querySelector('#builds')
  if (buildsElement && buildsElement.children && buildsElement.children.length > 0) {
    buildId = buildsElement.children[0].id;
  }

  return buildId;
}

function _buildCommand(targetGroup, pipelineName, varsList, jobName, buildNumber) {
  var cmd = 'fly -t ' + targetGroup + ' hijack -j ' + pipelineName;
  
  if (varsList && varsList.length) {
    cmd += '/' + varsList.join(',');
  }
  
  cmd += '/' + jobName + ' -b ' + buildNumber;

  return cmd;
}

function _addCopyLogins() {
  var leftIconAtRight = document.querySelector('.build-header div:nth-child(2)')
  if (leftIconAtRight) {
    var host = window.location.host;
    var button = document.createElement('button');
    button.append(document.createTextNode('Logins'));
    leftIconAtRight.insertAdjacentElement('afterbegin', button);

    var targetGroup = _findInstanceGroupName();
    button.onclick = function(ev) {
      navigator.clipboard.writeText('fly login -t ' + targetGroup + ' -c ' + host + ' -n HOSTNAME');
    } 
  }
}

function _addCommandToSteps(flyCmd) {
  var steps = document.querySelectorAll('.build-step')
  for (j in steps) {
    var step = steps[j];

    console.debug('step ' + step.innerHTML);
    if (!step.children || step.children.length == 0) {
      break;
    }

    var taskHeader = step.children[0].querySelector('div').textContent;
    if (taskHeader && taskHeader.startsWith('task')) {
      var taskName = step.children[0].querySelector('div h3').textContent;
      var taskActions = step.children[0].children[1];

      var anyPreviousAction = taskActions.querySelector('.extension-action');
      if (anyPreviousAction) {
        continue;
      }
  
      (function(pTaskActions, pFlyCmd, pTaskName) {
        const action = document.createElement("a");
        action.className = "extension-action";
        const actionContainer = document.createElement("h3");
        actionContainer.appendChild(action);
        action.textContent = `🪂`;
        action.onclick = function(ev) {
          navigator.clipboard.writeText(pFlyCmd + ' -s ' + pTaskName);
        }
        pTaskActions.insertAdjacentElement("beforeend", actionContainer);
      })(taskActions, flyCmd, taskName);
    }
  }
}