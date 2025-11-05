---
title: 'WindowsでのJenkinsのDocker Agent使用時の注意'
description: '私はLinux強盗です、Linuxをください'
pubDate: 'Nov 18 2024'
heroImage: '../../../assets/images/linux_robber.jpeg'
category: 'Backend'
tags: ['jenkins', 'ci']
lang: 'ja'
---

# 社内セミナー後

社内でフロントエンドテスト戦略を主題としたセミナーを開催しました。セミナー後の質疑応答内容をプレゼンテーション資料に整理する際、以下のような状況を発見しました。

> Windows環境でJenkinsを構成する場合、dockerが実行されない

私の場合も、Frontend CIをWindowsで実行していたのは同じ状況でしたが、私はJenkins自体をjenkins/jenkinsイメージを使用して実行していたため、実質的にLinuxで実行しているのと同じでした。そのため、私は問題が発生しませんでした。dockerがOSに影響を受けるのか？そんなはずはないでしょうが...

# 問題の原因

docker agentを実行しながら発生するすべてのログを徹底的に調査しました。問題の原因は、docker pipelineがHostとContainerのvolumeをマッピングする際、`:`という文字を基準にパースするのですが：

> Windowsの場合、`C:\\何か:コンテナボリューム`で`:`が2回出現する

これはDockerの問題ではなく、Jenkinsプラグインであるdocker pluginの問題です。

# 解決方法

docker pipelineを修正するには工数が多くかかり、  
既にJenkins設定が複雑なため、今Windows Jenkinsをdocker上に移動するのは望ましくないため、  
該当パイプラインのみLinux PCにagentを作成し、SSH接続してノードを作成しました。
