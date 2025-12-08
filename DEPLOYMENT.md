# Azure Static Web Apps Deployment Guide

This guide walks you through deploying the Cemetery Management System to Azure Static Web Apps.

## Prerequisites

- Azure subscription
- GitHub account with access to the repository
- Repository pushed to GitHub: `https://github.com/sibusisondlovu/cemetry360-frontend`

## Step 1: Create Azure Static Web App Resource

1. Log into the [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Static Web App"** and select it
4. Click **"Create"**

### Configuration Settings:

**Basics:**
- **Subscription**: Select your Azure subscription
- **Resource Group**: Create new or use existing
- **Name**: `cemetry360-frontend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., South Africa North)
- **Plan type**: Free (or Standard if needed)

**Deployment details:**
- **Source**: GitHub
- **Organization**: sibusisondlovu
- **Repository**: cemetry360-frontend
- **Branch**: main

**Build Details:**
- **Build Presets**: React
- **App location**: `/`
- **Api location**: (leave empty)
- **Output location**: `build`

5. Click **"Review + create"** then **"Create"**

## Step 2: Get Deployment Token

After the Azure resource is created:

1. Go to the Static Web App resource in Azure Portal
2. Click on **"Manage deployment token"** in the Overview section
3. Copy the deployment token (you'll need this for GitHub)

## Step 3: Configure GitHub Secret

1. Go to your GitHub repository: https://github.com/sibusisondlovu/cemetry360-frontend
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
5. Value: Paste the deployment token from Step 2
6. Click **"Add secret"**

## Step 4: Configure Environment Variables (Optional)

If your app requires environment variables (like backend API URL):

### Option A: Using Azure Portal
1. In Azure Portal, go to your Static Web App
2. Navigate to **Configuration** in the left menu
3. Click **"+ Add"** under Application settings
4. Add each environment variable:
   - Name: `REACT_APP_API_URL`
   - Value: Your backend API URL
5. Click **"Save"**

### Option B: Using GitHub Secrets (for build-time variables)
1. Add secrets to GitHub repository (Settings → Secrets and variables → Actions)
2. Update `.github/workflows/azure-static-web-apps.yml` env section
3. Uncomment and add your variables

## Step 5: Deploy

The GitHub Actions workflow is now configured to automatically deploy when you push to the `main` branch.

### Manual Trigger:
```bash
# Commit and push the configuration files
git add .
git commit -m "Add Azure Static Web Apps deployment configuration"
git push origin main
```

### Monitor Deployment:
1. Go to your GitHub repository
2. Click on the **"Actions"** tab
3. You should see the workflow running
4. Click on the workflow run to see detailed logs

## Step 6: Verify Deployment

Once the deployment completes:

1. In Azure Portal, go to your Static Web App resource
2. Copy the **URL** from the Overview section (e.g., `https://happy-rock-123abc.azurestaticapps.net`)
3. Open the URL in your browser
4. Verify:
   - Login page loads correctly
   - Assets (CSS, JS) load without errors
   - Check browser console for any errors
   - Test navigation after login

## Custom Domain (Optional)

To add a custom domain:

1. In Azure Portal, go to your Static Web App
2. Navigate to **Custom domains** in the left menu
3. Click **"+ Add"**
4. Follow the wizard to add and verify your domain

## Troubleshooting

### Build Fails with "Command not found"
**Solution**: Ensure `package.json` has all required dependencies listed.

### 404 Errors on Page Refresh
**Solution**: Verify `staticwebapp.config.json` exists with proper routing configuration.

### Environment Variables Not Working
**Solution**: 
- Build-time variables (REACT_APP_*): Must be set in GitHub workflow or Azure Configuration
- The app needs to be rebuilt after adding env variables
- Verify variable names start with `REACT_APP_`

### Deployment Token Invalid
**Solution**: 
1. Generate a new deployment token in Azure Portal
2. Update the GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`

### Assets Not Loading (MIME Type Errors)
**Solution**: The `staticwebapp.config.json` file should handle this. Verify it exists and has proper MIME type configuration.

## Monitoring and Logs

### View Application Logs:
1. Azure Portal → Your Static Web App
2. Navigate to **Application Insights** (if enabled)
3. Or use **Monitoring** section for basic metrics

### View Deployment Logs:
- Check GitHub Actions tab for build logs
- Check Azure Portal → Static Web App → Deployments for deployment history

## Rollback

To rollback to a previous version:

1. In Azure Portal, go to your Static Web App
2. Navigate to **Deployments** in the left menu
3. Find the successful deployment you want to rollback to
4. Click on it and select **"Promote to production"**

## Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
