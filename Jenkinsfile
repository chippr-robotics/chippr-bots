pipeline {
<<<<<<< HEAD
    agent any
    
    echo $SVN_REVISION
    svn_last_successful_build_revision=`curl $JOB_URL'lastSuccessfulBuild/api/json' | python -c 'import json,sys;obj=json.loads(sys.stdin.read());print obj["'"changeSet"'"]["'"revisions"'"][0]["'"revision"'"]'`
    diff=`svn di -r$SVN_REVISION:$svn_last_successful_build_revision --summarize`
=======
  environment {
    API_IMAGE="chipprbots/bridgette-api"
  }
  agent any
  stages {
    stage('Cloning Git') {
      steps {
        git 'https://github.com/chippr-robotics/chippr-bots'
      }
    }
    stage('Bridgette API build') {
        when{
            changeset "**/packages/bridgette-api/*.*"
        }
        steps{
            dir("./packages/bridgette-api") {
                sh "npm run test"
                sh "docker build -t $API_IMAGE:$BUILD_NUMBER ."
                sh "docker service update --image $API_IMAGE:$BUILD_NUMBER bridgette_api"
                sh "docker build -t $API_IMAGE:latest ."  
                sh "docker rmi $API_IMAGE:$BUILD_NUMBER"
        }
      }
    }
>>>>>>> 6a97740eaddc3da51e45767e9e0e6ae1629fd080

    stage('Common Files build') {
        when{
            changeset "**/packages/common/*.*"
        }
        steps{
            dir("./packages/common") {
                sh "npm publish"
        }
      }
    }

    stage('BridgetteDB build') {
        when{
            changeset "**/packages/bridgetteDB/*.*"
        }
        steps{
            dir("./packages/bridgette-DB") {
                sh "npm run test"
                sh "npm publish"
           }
        }
    }

    stage('Bridgette V1 build') {
        when{
            changeset "**/packages/bridgette-v1/*.*"
        }
        steps{
            dir("./packages/bridgette-v1") {
                sh "npm run test"
                sh "docker build -t $V1_IMAGE:$BUILD_NUMBER ."
                sh "docker service update --image $V1_IMAGE:$BUILD_NUMBER bridgette_discord"
                sh "docker build -t $V1_IMAGE:latest ."  
                sh "docker rmi $V1_IMAGE:$BUILD_NUMBER"
            }
        } 
    }
   }
  
   post {
    always {
     withCredentials([string(credentialsId: 'discord_webhook', variable: 'WEBHOOK')]) {
        discordSend description: 'Jenkins Pipeline Build', 
        link: BUILD_URL, 
        successful: currentBuild.resultIsBetterOrEqualTo('SUCCESS'), 
        title: JOB_NAME, 
        webhookURL: WEBHOOK
         
     }
    }
  }
}