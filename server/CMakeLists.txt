cmake_minimum_required(VERSION 3.10)
project(RecommendationSystem)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON) 

# Fetch GoogleTest
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/release-1.11.0.zip
)

set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Collect files
file(GLOB_RECURSE CORE_SOURCES "src/*.cpp")
# Avoid double definition of main.cpp
list(FILTER CORE_SOURCES EXCLUDE REGEX "src/main.cpp")

file(GLOB_RECURSE TEST_SOURCES "test/*.cpp")

# Create file directories for the user_files
file(MAKE_DIRECTORY ${CMAKE_BINARY_DIR}/data/user_files)

# Create a static library for the project logic
# This prevents recompiling the same files twice
add_library(project_logic STATIC ${CORE_SOURCES})
target_include_directories(project_logic PUBLIC src)

# --- SERVER EXECUTABLE ---
add_executable(server src/main.cpp)
target_link_libraries(server project_logic pthread)

# --- TESTS EXECUTABLE ---
add_executable(tests ${TEST_SOURCES})
target_link_libraries(tests project_logic gtest_main pthread)

# Include paths for tests (to find headers in src/)
target_include_directories(tests PUBLIC src)