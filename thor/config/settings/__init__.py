import os


environment = os.environ.get('DJANGO_ENV', "")

# environment = 'dev'
#
print "ENVIRONMENT: " + environment

from thor.config.settings.main import *

if environment == "dev":
    from thor.config.settings.dev import *
elif environment == "local":
    from thor.config.settings.local import *
else:
    from thor.config.settings.prod import *
