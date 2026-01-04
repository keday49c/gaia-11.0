cmake_minimum_required(VERSION 3.24)
project(GaiaPackage NONE)

# Gaia packaging using Node tooling (npm, npx/pkg). This CMake script orchestrates
# the following steps:
#  - npm ci
#  - npm run build --workspace=server
#  - npm run build --workspace=client
#  - npx pkg server/dist/index.js --targets node20-win-x64 --output <build>/release/gaia-server.exe
#  - copy client dist into release/static
#  - create ZIP (and NSIS installer if available) via CPack

# Output directories
set(GAIA_BUILD_DIR "${CMAKE_BINARY_DIR}")
set(GAIA_RELEASE_DIR "${GAIA_BUILD_DIR}/release")
file(MAKE_DIRECTORY ${GAIA_RELEASE_DIR})

# Ensure Node is available
find_program(NODE_EXECUTABLE node)
if(NOT NODE_EXECUTABLE)
  message(FATAL_ERROR "Node.js not found in PATH. Install Node >= 20 and rerun CMake.")
endif()

# Target: npm install (workspaces)
add_custom_target(gaia_npm_install
  COMMAND ${CMAKE_COMMAND} -E echo "Running npm ci (workspaces)..."
  COMMAND npm ci
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  COMMENT "Installing npm dependencies (workspaces)"
)

# Target: build server (TypeScript -> dist)
add_custom_target(gaia_build_server
  COMMAND ${CMAKE_COMMAND} -E echo "Building server (tsc)..."
  COMMAND npm run build --workspace=server
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  DEPENDS gaia_npm_install
  COMMENT "Building server (TypeScript)"
)

# Target: build client (Vite)
add_custom_target(gaia_build_client
  COMMAND ${CMAKE_COMMAND} -E echo "Building client (Vite build)..."
  COMMAND npm run build --workspace=client
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  DEPENDS gaia_npm_install
  COMMENT "Building client (Vite)"
)

# Target: package using pkg (creates a standalone Windows .exe)
add_custom_target(gaia_pkg ALL
  COMMAND ${CMAKE_COMMAND} -E echo "Packaging backend with pkg (creating gaia-server.exe)..."
  COMMAND ${CMAKE_COMMAND} -E make_directory ${GAIA_RELEASE_DIR}
  COMMAND ${CMAKE_COMMAND} -E chdir ${CMAKE_SOURCE_DIR} npx pkg server/dist/index.js --targets node20-win-x64 --output ${GAIA_RELEASE_DIR}/gaia-server.exe
  WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
  DEPENDS gaia_build_server gaia_build_client
  COMMENT "Running pkg to produce gaia-server.exe"
)

# Copy client static files into release/static
add_custom_command(TARGET gaia_pkg POST_BUILD
  COMMAND ${CMAKE_COMMAND} -E echo "Copying client dist to release/static..."
  COMMAND ${CMAKE_COMMAND} -E remove_directory ${GAIA_RELEASE_DIR}/static
  COMMAND ${CMAKE_COMMAND} -E copy_directory ${CMAKE_SOURCE_DIR}/client/dist ${GAIA_RELEASE_DIR}/static
  COMMENT "Copying client static build into package"
)

# Basic metadata for CPack
set(GAIA_VERSION "1.0.0")
set(CPACK_PACKAGE_NAME "Gaia")
set(CPACK_PACKAGE_VERSION ${GAIA_VERSION})
set(CPACK_PACKAGE_VENDOR "Gaia Project")
set(CPACK_RESOURCE_FILE_LICENSE "${CMAKE_SOURCE_DIR}/LICENSE")
set(CPACK_PACKAGE_FILE_NAME "gaia-${GAIA_VERSION}-${CMAKE_SYSTEM_NAME}-${CMAKE_SYSTEM_PROCESSOR}")

# Always create a ZIP; NSIS (Windows installer) only if available
set(CPACK_GENERATOR "ZIP")
find_program(NSIS_EXECUTABLE makensis)
if(NSIS_EXECUTABLE)
  list(APPEND CPACK_GENERATOR "NSIS")
  set(CPACK_NSIS_DISPLAY_NAME "Gaia")
  set(CPACK_NSIS_MUI_ICON "${CMAKE_SOURCE_DIR}/assets/icon.ico")
endif()

include(CPack)

message(STATUS "CMake targets:")
message(STATUS " - gaia_npm_install: instala dependências (npm ci)")
message(STATUS " - gaia_build_server: compila o backend (tsc)")
message(STATUS " - gaia_build_client: compila o frontend (vite build)")
message(STATUS " - gaia_pkg: cria gaia-server.exe com pkg e monta release/")

# Helpful targets for users
add_custom_target(gaia_prepare DEPENDS gaia_npm_install gaia_build_server gaia_build_client)
add_custom_target(gaia_package DEPENDS gaia_pkg)

# Note: This CMake script assumes Node >=20, npm >=10 and that the server build (server/dist/index.js)
# is compatible with pkg. Native modules or dynamic requires may need extra handling.

```