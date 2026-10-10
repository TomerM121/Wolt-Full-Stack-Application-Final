#include "Config.h"

std::string Config::basePath = "";

/*
 * Sets base path
 */
void Config::setBasePath(const std::string& path)
{
    basePath = path;
}

/*
 * Returns base path
 */
std::string Config::getBasePath()
{
    return basePath;
}