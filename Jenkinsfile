pipeline {
    agent any
    
    echo $SVN_REVISION
    svn_last_successful_build_revision=`curl $JOB_URL'lastSuccessfulBuild/api/json' | python -c 'import json,sys;obj=json.loads(sys.stdin.read());print obj["'"changeSet"'"]["'"revisions"'"][0]["'"revision"'"]'`
    diff=`svn di -r$SVN_REVISION:$svn_last_successful_build_revision --summarize`

    stages {
        stage('Build') {
            steps {
                echo 'Building..'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
