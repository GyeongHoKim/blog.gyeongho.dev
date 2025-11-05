---
title: 'Frontend Test Strategy #2'
description: 'About visual regression testing and CI/CD automation experience'
pubDate: 'Nov 7 2024'
heroImage: '../../../assets/images/dog.png'
category: 'Frontend'
tags: ['test', 'component']
lang: 'en'
---

# How to Determine if a Design Change is Intentional

After taking on frontend work at the company, I started creating a design system. I created about 40 components and actually used them in 4 services.
When a bug occurs in any one of the 4 services, the service needs to keep running immediately, so in urgent situations, we patch even the design system components, and the following situations occur:

- Other components that import common styles and attach them within shadowDOM have broken UI.
- We thought it was a functional modification so UI wouldn't matter, but it turned out that function was dynamically manipulating DOM elements, and we only realized after deployment.
- We were told the icon was changed but the size was the same, but it turned out there was a 3px height difference, and while 3 services had no issues, 1 service had top/bottom misalignment due to those 3px.

How should we manually verify this? Or what should we do if the UI only breaks in a specific sequence and that sequence is labor-intensive?

# Visual Regression Testing Environment and Tools

In my case:

- Each service: Set up staging server and use BackstopJS
  - Because we need to test at the page level or side effects from user actions
- Design system: Use Cypress + self-hosted test dashboard server / Percy.io simultaneously
  - Since each service imports and uses components anyway, accessing pages and comparing doesn't make sense
  - Storybook integration is possible, so we can run tests without writing test code

For the design system, I use the Cypress Image Snapshot plugin to create reference image snapshots directly, upload them to git, and use a self-hosted test dashboard server composed of minio storage + mongodb + dashboard server. The reason is cost. Percy's free account has a monthly request limit.

So Percy runs once every 2 weeks, and visual regression tests on the self-hosted test dashboard run daily.

# Cypress Image Snapshot + Self-Hosted Test Dashboard Server

![sorry-cypress dashboard image](../../../assets/images/sorry-cypress.png)

With cypress, the image snapshot plugin, and a self-hosted server combination, you can run visual regression tests for free.  
The downside is that there's no approval feature when there are design changes, so you have to manually retake reference images and upload them to git before it passes.

# Percy + Storybook

![percy dashboard image](../../../assets/images/percy.png)

Everyone should be familiar with Percy. It supports Storybook integration and also provides Cypress SDK. It's convenient.  
The downside is it costs money. No matter how much I love the service, I don't want to pay my own money for company products, so I run it once every 2 weeks.

# Precautions When Integrating with Jenkins CI

## Docker-related Issues

There is an issue with the latest version of Jenkins' docker pipeline with Windows environment docker agents (the problem where `C:\\` Windows paths are recognized as the separator `:` causing parsing errors when setting docker agent volumes, etc.). Since there were no spare Linux-based PCs, I had no choice but to run it as a Jenkins agent on a Windows OS Jenkins server, but I recommend creating a Linux environment docker agent. Or, recommend running the Jenkins server itself in docker.

## About Jenkinsfile and Its Trigger Conditions

You must be very careful with pipeline trigger conditions. If you make a mistake, you could use up all the requests allocated to your Percy free account in an instant and end up with nothing to do.  
My case is a bit special - due to serious indexing performance issues with the company's internal git server, frontend developers can't use git, so I can't create a repository for the design system on the internal Git server.  
So I'm quietly cohabiting in a backend developer's repository, and if I had set a trigger on the master branch, tests would run according to the backend's feature development or commit cycle.  
I calculated that running Percy tests once every 2 weeks would send about 5000 requests per month, but if tests ran every time the backend developer changed or added features, we'd use them all up in an instant.

So I had to find another way and chose webhooks. I added a generic webhook pipeline to Jenkins so that when I send requests to specific URLs on the jenkins server, each Jenkins pipeline runs.
