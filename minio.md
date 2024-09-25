### Minio Installation Note

This note provides a step-by-step guide to install and run Minio using the `minio/minio` Docker image. - [here](https://hub.docker.com/r/minio/minio)

#### **Prerequisites**
1. **Docker Installed:** Ensure you have Docker installed on your system. You can follow the instructions [here](https://docs.docker.com/get-docker/) to install Docker.

#### **Step-by-Step Installation**

1. **Create a Directory for Storage**
   - Choose a directory on your host machine to store Minio files. For example:
   
   ```bash
   mkdir -p /opt/minio/data
   chown -R 1001:1001 /opt/minio/data
   chmod -R 755 /opt/minio/data
   ```

2. **Run Minio Container**
   - Use the following `docker run` command to start Minio in detached mode, exposing both the API and Console:

   ```bash
   docker run -d --name minio \
     -v /opt/minio/data:/bitnami/minio/data \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin123 \
     -p 9000:9000 \
     -p 9001:9001 \
     bitnami/minio:latest
   ```

3. **Access Minio Console**
   - After starting the Minio container, you can access the Minio Console via a web browser:
   
   ```
   http://localhost:9001
   ```
   
   - Log in using the credentials you set in the environment variables:
     - **Username:** `minioadmin`
     - **Password:** `minioadmin123`

4. **Access Minio API**
   - The Minio API is accessible via port 9000.
   
   ```
   http://localhost:9000
   ```

5. **Verify Data Persistence**
   - Verify that Minio files are stored in your specified host directory:
   
   ```bash
   ls /opt/minio/data
   ```

6. **Additional Configuration (Optional)**
   - You may choose to update Minio configurations as needed. For example, setting up SSL, creating additional users, or setting policies.

7. **Stopping and Restarting Minio**
   - To stop Minio:
   
   ```bash
   docker stop minio
   ```
   
   - To start Minio again:
   
   ```bash
   docker start minio
   ```
   
   - To remove Minio (if required):
   
   ```bash
   docker rm -f minio
   ```

8. **Block Public Access to Minio**
```
Disable port 9000 and 9001 for public access. Only allow localhost.
```

### Troubleshooting
- **Incorrect Credentials:** Verify the credentials provided with the `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` environment variables.
- **Port Conflicts:** Ensure that ports 9000 and 9001 are not in use by other services.

### Conclusion
With Minio now running in a Docker container, you can store and manage your object storage data efficiently using the S3-compatible Minio API.

