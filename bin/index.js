#!/usr/bin/env node

const fs = require("fs")
const {parseString} = require("xml2js")

if (process.argv.length < 3) {
  console.log("Usage:\n > assert-junit-reports <path to folder with Junit XML result files>")
  console.log("")
  console.log("Command will generate error code 1 if any of the XML files contains failed tests.")
  process.exit(1)
}

const directory = process.argv[2]

const files = []

fs.readdirSync(directory).forEach(file => {
  if (!file.endsWith(".xml")) return
  files.push(file)
})

for (const file of files) {
  const xmlString = fs.readFileSync(directory + "/" + file, "utf8")

  try {
    parseString(xmlString, {
        mergeAttrs: true,
        explicitArray: false,
        trim: true
      },
      (error, result) => {
        if (error === null) {
          assertTestSuites(result)
        } else {
          console.log(error)
          process.exit(1)
        }
      })
  } catch (e) {
    console.log("Failed to parse file " + file, e)
    process.exit(1)
  }
}

function assertTestSuites({testsuite, testsuites}) {
  let suites;

  if (testsuites) {
    suites = Array.isArray(testsuites.testsuite) ? testsuites.testsuite : [testsuites.testsuite];
  } else {
    suites = [testsuite];
  }

  for (const suite of suites) {
    if (suite.failures !== "0" || suite.errors !== "0") {
      console.log(`Test "${testsuites.name}.${suite.name}" failed, exiting`)
      process.exit(1)
    }
  }
}