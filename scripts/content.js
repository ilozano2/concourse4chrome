_tryInit();

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
    }
  }, 5000);
}

/*******************************************/
/********** Auxiliary functions ************/
/*******************************************/

function _isLoading() {
  const headers = document.querySelectorAll('.build-step .header:not(.loading-header)');
  return !headers;
}

function _findInstanceGroupName() {
  var instanceGroup = document.querySelector('#breadcrumb-instance-group');
  if (instanceGroup) {
    targetGroup = instanceGroup.innerText.replaceAll(/.*\n/g, '');
  }

  return targetGroup;
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
    var vars = pipelineUri.split('&')
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
  'fly -t ' + targetGroup + ' hijack -j ' + pipelineName + '/' + varsList.join(',') + '/' + jobName + ' -b ' + buildNumber;
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
  
      (function(pTaskActions, pFlyCmd, pTaskName) {
        const action = document.createElement("a");
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