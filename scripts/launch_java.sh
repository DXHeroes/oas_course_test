#!/bin/bash

build_and_run() {
    local java_example_base="$1"
    local maven_wrapper_path="$java_example_base/mvnw"

    # Build the project using Maven Wrapper
    echo "Building the project..."
    "$maven_wrapper_path" clean package -f "$java_example_base/pom.xml"

    # Check if build was successful
    if [ $? -eq 0 ]; then
        echo "Build successful. Starting application..."
        
        # Find and execute the jar file from the correct target directory
        local jar_file=$(find "$java_example_base/target" -name "*-SNAPSHOT.jar" ! -name "*-sources.jar" ! -name "*-javadoc.jar" | head -1)
        
        if [ -n "$jar_file" ]; then
            java -jar "$jar_file"
        else
            echo "Error: Could not find the jar file"
            exit 1
        fi
    else
        echo "Build failed"
        exit 1
    fi
}

SECTIONS_BASE="./java_example"

build_and_run "$SECTIONS_BASE"