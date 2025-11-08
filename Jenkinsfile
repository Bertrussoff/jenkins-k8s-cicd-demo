pipeline {
  agent any

  parameters {
    string(name: 'DOCKERHUB_USERNAME', defaultValue: 'your-dockerhub-username', description: 'Docker Hub username')
    string(name: 'IMAGE_NAME', defaultValue: 'jenkins-k8s-cicd-demo', description: 'Docker image/repo name')
    string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Docker image tag')
    string(name: 'KUBE_NAMESPACE', defaultValue: 'demo', description: 'Kubernetes namespace to deploy into')
  }

  environment {
    REGISTRY = "docker.io"
    IMAGE = "${params.DOCKERHUB_USERNAME}/${params.IMAGE_NAME}:${params.IMAGE_TAG}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          sh 'docker version'
          sh 'docker build -t ${IMAGE} .'
        }
      }
    }

    stage('Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
          sh 'docker push ${IMAGE}'
        }
      }
    }

    stage('Kubeconfig') {
      steps {
        script {
          // Option A: Secret File
          def hasFile = false
          try {
            withCredentials([file(credentialsId: 'kubeconfig-file', variable: 'KCFG_FILE')]) {
              sh 'mkdir -p $WORKSPACE/.kube && cp "$KCFG_FILE" $WORKSPACE/.kube/config'
              hasFile = true
            }
          } catch (e) {
            echo "kubeconfig-file not configured, will try secret text..."
          }

          // Option B: Secret Text
          if (!hasFile) {
            withCredentials([string(credentialsId: 'kubeconfig', variable: 'KCFG')]) {
              sh 'mkdir -p $WORKSPACE/.kube && echo "$KCFG" > $WORKSPACE/.kube/config'
            }
          }
          sh 'chmod 600 $WORKSPACE/.kube/config'
          sh 'kubectl version --client'
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        script {
          sh 'kubectl --kubeconfig=$WORKSPACE/.kube/config apply -f k8s/namespace.yaml'
          sh 'kubectl --kubeconfig=$WORKSPACE/.kube/config -n ${params.KUBE_NAMESPACE} set image deployment/jenkins-k8s-cicd-demo app=${IMAGE} --record=true || true'
          sh 'kubectl --kubeconfig=$WORKSPACE/.kube/config -n ${params.KUBE_NAMESPACE} apply -f k8s/deployment.yaml'
          sh 'kubectl --kubeconfig=$WORKSPACE/.kube/config -n ${params.KUBE_NAMESPACE} apply -f k8s/service.yaml'
          sh 'kubectl --kubeconfig=$WORKSPACE/.kube/config -n ${params.KUBE_NAMESPACE} rollout status deployment/jenkins-k8s-cicd-demo'
        }
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
      archiveArtifacts artifacts: 'k8s/*.yaml', fingerprint: true
    }
  }
}
