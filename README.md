# Jenkins + Docker + Kubernetes CI/CD Demo

A minimal Node.js app with a Jenkins pipeline that:
1. Builds and pushes a Docker image to Docker Hub.
2. Deploys/updates the app on Kubernetes using kubectl apply.

## Repository Layout
```
.
├─ app/
│  ├─ package.json
│  ├─ server.js
│  └─ public/index.html
├─ Dockerfile
├─ .dockerignore
├─ Jenkinsfile
├─ k8s/
│  ├─ namespace.yaml
│  ├─ deployment.yaml
│  └─ service.yaml
└─ README.md
```

## Prerequisites
- Docker (to build locally)
- Kubernetes cluster & `kubectl` configured (e.g., Minikube, Kind, or a cloud cluster)
- Jenkins with Docker-in-Docker or Docker socket available, and `kubectl` installed in the agent
- Docker Hub account and repo (e.g. `DOCKERHUB_USERNAME/jenkins-k8s-cicd-demo`)

## Configure Jenkins Credentials
Create these Jenkins credentials:
- **Username with password**: ID `dockerhub-creds` → your Docker Hub username/password.
- **Secret file** *or* **Secret text** for kubeconfig:
  - If secret file: ID `kubeconfig-file` (upload your kubeconfig).
  - If secret text: ID `kubeconfig` (paste your kubeconfig). The Jenkinsfile supports either.

## Jenkins Parameters
The pipeline is parameterized:
- `DOCKERHUB_USERNAME` — your Docker Hub username
- `IMAGE_NAME` — repository name (default `jenkins-k8s-cicd-demo`)
- `IMAGE_TAG` — image tag (default `latest`)
- `KUBE_NAMESPACE` — Kubernetes namespace (default `demo`)

## One-time Setup (Kubernetes)
```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/service.yaml
# The pipeline will apply deployment.yaml automatically on first run; you can also apply it manually:
kubectl apply -f k8s/deployment.yaml
```

## Local test
```
# Build and run locally
docker build -t local/jenkins-k8s-cicd-demo:dev .
docker run -p 8080:3000 local/jenkins-k8s-cicd-demo:dev
# Open http://localhost:8080
```

## Trigger the Jenkins Job
1. Create a Multibranch Pipeline or a Pipeline job pointing to this repo.
2. Set the parameters (or leave defaults) and run.
3. On success, check the service:
   - Port-forward: `kubectl -n demo port-forward svc/jenkins-k8s-cicd-demo 8080:80` then open http://localhost:8080
   - Or expose via ingress (not included here by default).

## Notes
- The Deployment uses `imagePullPolicy: Always` so updates are pulled each deploy.
- For production, consider a Helm chart, RBAC-bound service accounts, and sealed secrets.
