import os


environment = os.environ.get('DJANGO_ENV', "")

# environment = 'dev'
#
print "ENVIRONMENT: " + environment

from main import *

if environment == "dev":
    from dev import *
elif environment == "local":
    from local import *
else:
    from prod import *
