plugins {
    id("software.amazon.smithy").version("0.7.0")
}

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("software.amazon.smithy.typescript:smithy-aws-typescript-codegen:0.12.0")
        classpath("software.amazon.smithy:smithy-openapi:1.36.0")
        classpath("software.amazon.smithy:smithy-aws-traits:1.36.0")
    }
}

repositories {
    mavenLocal()
    mavenCentral()
}

dependencies {
    implementation("software.amazon.smithy:smithy-model:1.30.0")
    implementation("software.amazon.smithy:smithy-aws-traits:1.30.0")
    implementation("software.amazon.smithy:smithy-validation-model:1.30.0")
    implementation("software.amazon.smithy:smithy-linters:1.30.0")
}

configure<software.amazon.smithy.gradle.SmithyExtension> {
    // Uncomment this to use a custom projection when building the JAR.
    outputDirectory = file(project.getBuildDir().toPath().resolve("projections").toFile())
}

// Uncomment to disable creating a JAR.
//tasks["jar"].enabled = false
