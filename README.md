# Regex-checkstyle
Regex-checkstyle is a tool for finding mistakes in code using regexes and reporting them in checkstyle format. It was created to improve pull request decoration with typical sql errors.

## Prerequisites
Project requires:
- nodejs 10
- npm

## Installation
All arifacts are published to npm. To use the latest version, you can install it using:
```
npm i --save-dev @bartekbp/regex-checkstyle
```

## Usage

Library executes a regular expression over files with optional text substitution and reports results in `checkstyle` format.
You can use it to find variables in code that begin with underscore and recommend to strip it:
```
> npx @bartekbp/regex-checkstyle -p '(const|let)\s+(_.*)' -s 'Variable $2 has a name starting with underscore. Please remove it.' 'src/**/*.js'
```

Supported parameters:
- `-p` specifies regex to use for finding  text
- `-s` specifies substitution

The last positional argument is a glob that specifies searched files. For example glob values please refer to
https://github.com/mrmlnc/fast-glob.

### Pull request decoration with regex output
If you want to automate adding comments to your pull request based on regexes this tool will help you achieve it.
To configure it, I will use `jenkins`, but the solution applies to other continuous integration systems as well.

#### Jenkins pipleline

You need to setup a `jenkins pipeline` that will be triggered with [bitbucket branch source plugin](https://plugins.jenkins.io/cloudbees-bitbucket-branch-source/) or [github branch source plugin](https://github.com/jenkinsci/github-branch-source-plugin).
In the pipeline you need to run regex-checkstyle redirect output to a file:
```
stage('regex') {
  steps {
    sh  'npx @bartekbp/regex-checkstyle ... > regex-checkstyle.xml'
  }
}
```
Depending on your code review system, **tomasbjerre** created different plugins for pull request decoration. You can find the full list of them at the bottom of [violations-lib readme](https://github.com/tomasbjerre/violations-lib). I'll focus on the configuration for `bitbucket cloud`.

You need to update pipeline with additional stage for pr decoration:
<pre>
stage('Decorate pr') {
  steps {
    withCredentials([usernamePassword(credentialsId: <strong>'jenkins-pr-writes'</strong>, passwordVariable: 'JENKINS_VIOLATION_PASSWORD', usernameVariable: 'JENKINS_VIOLATION_USER')]) {
      sh 'npx violation-comments-to-bitbucket-cloud-command-line -u "$JENKINS_VIOLATION_USER" -p "$JENKINS_VIOLATION_PASSWORD" -ws <strong>workspace</strong> -rs <strong>repoName</strong> -prid "$CHANGE_ID" -v "CHECKSTYLE" "." ".*regex-checkstyle.xml$" "regex" || true'
    }
  }
}
</pre>
The bold parts in the stage needs to updated to reflect your project:
- **jenkins-pr-writes** with credentials to bitbucket user
- **workspace** with bitbucket workspace
- **repoName** with repository that has an opened pull request

## License

Distributed under the MIT License. See LICENSE for more information.

## Acknowledgements
Great thanks to:
- [tomasbjerre](https://github.com/tomasbjerre) for his tools enabling pull request decoration
- [jimf](https://github.com/jimf) for tool to convert json to xml checkstyle format
