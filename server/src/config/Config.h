#pragma once

#include <string>

/*
 * Global configuration
 */
class Config
{
private:
    static std::string basePath;

public:
    /*
     * Sets base path
     */
    static void setBasePath(const std::string& path);

    /*
     * Returns base path
     */
    static std::string getBasePath();
};