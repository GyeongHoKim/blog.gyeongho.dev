---
title: 'Precautions When Using Jenkins Docker Agent on Windows'
description: 'I am a Linux robber, give me Linux'
pubDate: 'Nov 18 2024'
heroImage: '../../../assets/images/linux_robber.jpeg'
category: 'Backend'
tags: ['jenkins', 'ci']
lang: 'en'
---

# After Company Seminar

I held a seminar at the company on frontend testing strategy. While organizing Q&A content into presentation materials after the seminar, I discovered the following situation:

> When configuring Jenkins on Windows, docker doesn't run

My case was also the same situation - I was running Frontend CI on Windows, but I was using the jenkins/jenkins image for Jenkins itself, so it was essentially running on Linux. So I didn't have the problem. Could docker be affected by OS? That shouldn't be possible...

# Problem Cause

I thoroughly examined all logs that occurred while running the docker agent. The cause of the problem is that when the docker pipeline maps volumes between Host and Container, it parses using ':' as a delimiter, but:

> In Windows' case, `C:\\something:containervolume` has ':' twice

This isn't a Docker problem - it's a problem with the docker plugin, which is a Jenkins plugin.

# Solution

Modifying the docker pipeline would require too much effort,  
and the Jenkins configuration is already complex, so I don't want to move Windows Jenkins to docker now.  
So I created an agent only for that pipeline on a Linux PC and created a node with SSH connection.
