# CronJobs

Automated scheduled tasks for database maintenance and operations.

## Overview

This directory contains CronJobs for:
- **Database backups**: Daily automated backups
- **Cleanup tasks**: Daily maintenance and cleanup

## CronJobs

### Database Backup CronJob

**File**: `cronjobs/db-backup-cronjob.yaml`

**Purpose**: Daily database backups at 2 AM

**Schedule**: `0 2 * * *` (Daily at 2:00 AM)

**Usage**:
```bash
kubectl apply -f cronjobs/db-backup-cronjob.yaml
```

**Check Status**:
```bash
kubectl get cronjobs -n k8s-microservices
kubectl get jobs -n k8s-microservices | grep db-backup
kubectl logs -n k8s-microservices job/db-backup-cronjob-<timestamp>
```

### Cleanup CronJob

**File**: `cronjobs/cleanup-cronjob.yaml`

**Purpose**: Daily cleanup tasks at 3 AM (after backup)

**Schedule**: `0 3 * * *` (Daily at 3:00 AM)

**Usage**:
```bash
kubectl apply -f cronjobs/cleanup-cronjob.yaml
```

**Check Status**:
```bash
kubectl get cronjobs -n k8s-microservices
kubectl get jobs -n k8s-microservices | grep cleanup
```

## Quick Start

### Deploy All CronJobs

```bash
# Deploy cronjobs
kubectl apply -f cronjobs/db-backup-cronjob.yaml
kubectl apply -f cronjobs/cleanup-cronjob.yaml
```

### Monitor Jobs

```bash
# View all jobs
kubectl get jobs -n k8s-microservices

# View all cronjobs
kubectl get cronjobs -n k8s-microservices

# View cronjob details
kubectl describe cronjob db-backup-cronjob -n k8s-microservices
```

### Test CronJob Manually

```bash
# Create a job from cronjob (for testing)
kubectl create job --from=cronjob/db-backup-cronjob db-backup-test -n k8s-microservices

# Check the test job
kubectl get jobs -n k8s-microservices | grep db-backup-test

# View logs
kubectl logs -n k8s-microservices job/db-backup-test
```

## Schedule Format

Cron schedule uses standard format: `"minute hour day month weekday"`

**Examples**:
- `"0 2 * * *"` - Daily at 2 AM
- `"*/5 * * * *"` - Every 5 minutes (for testing)
- `"0 */6 * * *"` - Every 6 hours
- `"0 0 * * 0"` - Every Sunday at midnight

## Job History

CronJobs automatically manage job history:
- `successfulJobsHistoryLimit: 3` - Keeps last 3 successful jobs
- `failedJobsHistoryLimit: 3` - Keeps last 3 failed jobs
- Old jobs beyond limits are automatically deleted

## Troubleshooting

### Job Not Running

```bash
# Check job status
kubectl describe job <job-name> -n k8s-microservices

# Check pod status
kubectl get pods -n k8s-microservices | grep <job-name>

# View pod logs
kubectl logs <pod-name> -n k8s-microservices
```

### CronJob Not Creating Jobs

```bash
# Check cronjob status
kubectl describe cronjob <cronjob-name> -n k8s-microservices

# Check if schedule is correct
kubectl get cronjob <cronjob-name> -n k8s-microservices -o yaml | grep schedule
```

### View All Job Logs

```bash
# Get latest backup job
LATEST_JOB=$(kubectl get jobs -n k8s-microservices -o jsonpath='{.items[?(@.metadata.name=~"db-backup.*")].metadata.name}' | awk '{print $1}')

# View logs
kubectl logs -n k8s-microservices job/$LATEST_JOB
```

## Cleanup

```bash
# Delete a job
kubectl delete job <job-name> -n k8s-microservices

# Delete a cronjob (stops scheduling)
kubectl delete cronjob <cronjob-name> -n k8s-microservices

# Delete all jobs created by a cronjob
kubectl delete jobs -n k8s-microservices -l job-name=<cronjob-name>
```

