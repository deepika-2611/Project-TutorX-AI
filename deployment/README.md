# TutorAI Linux Deployment

This folder contains the deployment files for hosting TutorAI on Ubuntu with Docker Compose, Neon PostgreSQL, and HTTPS on port `443`.

## Files

- `Dockerfile`: Builds the TutorAI app image.
- `Dockerfile.dockerignore`: Excludes local-only files from the Docker build context.
- `docker-compose.yml`: Runs the app and Caddy reverse proxy.
- `Caddyfile`: Serves the app over HTTPS and proxies traffic to the app container.
- `.env`: Runtime environment variables for the Linux server. Do not commit this file.

## Linux Server Setup

Install Docker and Compose plugin:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Allow HTTPS and HTTP:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## Environment File

Create or update `deployment/.env` on the server:

```env
DOMAIN=ai-tutorx.ddns.net
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
PGSSL=true
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_deepseek_key
GEMINI_API_KEY=your_gemini_key
SESSION_SECRET=replace_with_a_long_random_secret
PORT=8787
```

Do not use the default EC2 public DNS name for production HTTPS:

```env
DOMAIN=ec2-16-170-172-27.eu-north-1.compute.amazonaws.com
```

Let's Encrypt can reject AWS-owned `compute.amazonaws.com` hostnames with:

```text
Cannot issue for "ec2-...compute.amazonaws.com": forbidden by policy
```

For HTTPS on port `443`, use your mapped domain:

```env
DOMAIN=ai-tutorx.ddns.net
```

Make sure the DNS record points to your EC2 public IP:

```text
A record: ai-tutorx.ddns.net -> your EC2 public IP
```

Caddy still exposes port `80` because Let's Encrypt may use it for certificate validation and Caddy redirects HTTP traffic to HTTPS automatically. The application should be accessed using HTTPS.

## Run

From the project root:

```bash
cd deployment
docker compose up -d
```

Open:

```text
https://ai-tutorx.ddns.net
```

## Useful Commands

Check containers:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f app
docker compose logs -f caddy
```

Restart:

```bash
docker compose restart
```

Stop:

```bash
docker compose down
```

Pull and restart after a new image is published:

```bash
docker compose pull app
docker compose up -d --no-build
```

## CI/CD from GitHub Actions

The repository includes `.github/workflows/master-ci-cd.yml`.

On every pull request to `master`, it runs:

```text
npm ci
npm run build
docker build
```

On every push to `master`, it also:

```text
builds Docker image
pushes image to Docker Hub/private registry
tags each merge with an incremental version like v123
copies Compose/Caddy files to the Ubuntu server
writes deployment/.env on the server from GitHub Secrets
pulls the newly published versioned image
restarts the containers
```

Add these GitHub repository secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
DEPLOY_HOST
DEPLOY_USER
DEPLOY_SSH_KEY
DEPLOY_PORT
DEPLOY_PATH
DOMAIN
DATABASE_URL
LLM_PROVIDER
DEEPSEEK_API_KEY
DEEPSEEK_MODEL
DEEPSEEK_THINKING
GEMINI_API_KEY
GEMINI_MODEL
SESSION_SECRET
```

Recommended values:

```text
DOCKERHUB_USERNAME=deepika2611
DEPLOY_HOST=16.170.172.27
DEPLOY_USER=ubuntu
DEPLOY_PORT=22
DEPLOY_PATH=/opt/tutorx-ai
DOMAIN=ai-tutorx.ddns.net
LLM_PROVIDER=deepseek
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_THINKING=disabled
GEMINI_MODEL=gemini-2.0-flash
```

`DEPLOY_SSH_KEY` should be the private SSH key that can access the Ubuntu server.

The Docker image pushed for each merge will look like:

```text
deepika2611/project-tutorx-ai:v123
```

The number comes from the GitHub Actions run number, so it increments automatically for every workflow run.

If deployment fails with:

```text
service "app" has neither an image nor a build context specified
```

it means `APP_IMAGE` was empty on the server. The workflow writes it automatically as:

```text
APP_IMAGE=deepika2611/project-tutorx-ai:v<GITHUB_RUN_NUMBER>
```
