/***************************************************************
* Name:        IRIS - Integrated Radar Information System
* Purpose:     WebGis System for Meteorological Monitoring
*
* Author:      Roberto Cremonini, Armando Gaeta, Rocco Pispico
* Email:       sistemi.previsionali@arpa.piemonte.it
*
* Created:     01/01/2017
* Licence:     EUPL 1.1 Arpa Piemonte 2017
***************************************************************/

##############################################
Configuration steps for the IRIS-BASE machine
##############################################

The IRIS system was tested both on SO centos7_64bit and centos6.7_64bit.
Depending on the OS versions the installation procedures may differ.
Once the OS installed:
-> create user iris_user with pwd Iri$_w3bg1s
-> create user with root pwd Iri$2k16

- Run yum update immediately to upgrade the system


#IF ANY PROXY:
vi /etc/yum.conf 
proxy=http://<proxy_host>:<proxy_port>

Then install the EPEL repository and reload yum:
- yum install epel-release
- yum clean all


##############################################
INSTALLING MAIN PROGRAMS:

yum groupinstall 'Development Tools'
or its main components:
yum install gcc gcc-c++ make openssl-devel

yum install python python-devel python-libs python-matplotlib python-simplejson python-pip python-dateutil PyQt4.x86_64 PyQt4-devel.x86_64 swig
--> python version better 2.7.x or 2.6.x, swig version 2.0

yum install R-core R-devel R-core-devel R-java-devel

yum install httpd httpd-tools fcgi fcgi-devel
--> version httpd 2.2.x

yum install php php-common php-xml
yum install php-gd.x86_64 php-imap.x86_64 php-mcrypt.x86_64 php-pdo.x86_64 php-pgsql.x86_64 php-process.x86_64 php-xmlrpc.x86_64 php-php-gettext.noarch php-tcpdf.noarch php-tcpdf-dejavu-sans-fonts.noarch php-mbstring.x86_64 php-mysql.x86_64 php-cli mod_fcgid
--> version php 5.x

yum install geos geos-devel geos-python
--> versione geos 3.4.x

yum install ImageMagick ImageMagick-devel 

yum install libxml2-devel.x86_64 libpng-devel.x86_64 libjpeg-turbo-devel.x86_64 libgeotiff-devel.x86_64 giflib-devel.x86_64 gd-devel.x86_64 libcurl-devel.x86_64

yum install flex.x86_64 flex-devel.x86_64


##############################################
POSTGRESQL:
CentOS 7 comes basically with version 9.2. We need the 9.3.x. Download its repository - check for any updates and architecture of the OS (32 or 64bit):
yum install https://download.postgresql.org/pub/repos/yum/9.3/redhat/rhel-7-x86_64/pgdg-centos93-9.3-2.noarch.rpm

for Centos 6.7:
yum install https://download.postgresql.org/pub/repos/yum/9.3/redhat/rhel-6.7-x86_64/pgdg-centos93-9.3-2.noarch.rpm

Finally install:
yum install postgresql93 postgresql93-contrib postgresql93-devel postgresql93-libs postgresql93-server plr93

yum install postgis2_93 postgis2_93-devel postgis2_93-client postgis2_93-utils
--> version postgis 2.1.x

yum install python-psycopg2 

yum install libpqxx.x86_64 libpqxx-devel.x86_64

yum install pgadmin3_93.x86_64

Update the PATH environment variable:
PATH=$PATH:/usr/pgsql-9.3/bin/
pip install --proxy <proxy_host>:<proxy_port> PyGreSQL
pip install --proxy <proxy_host>:<proxy_port> SQLAlchemy


##############################################
PROJ and GDAL:

## OS version CentOS 7:
yum install proj proj-devel proj-epsg
pip install --proxy <proxy_host>:<proxy_port> pyproj
OR
export http_proxy=http://<proxy_host>:<proxy_port>
export https_proxy=http://<proxy_host>:<proxy_port>
pip install pyproj
--> version proj 4.8.x

yum install gdal gdal-devel gdal-java gdal-libs gdal-python
--> version gdal >= 1.9.x

In case of dependency problem, choose the EPEL version of gdal:
yum --disablerepo="*" --enablerepo=epel install gdal gdal-devel gdal-java gdal-libs gdal-python


## OS version CentOS 6.7:
yum --disablerepo="epel" --enablerepo="pgdg93" install proj proj-devel proj-epsg
yum --disablerepo="epel" --enablerepo="pgdg93" install gdal gdal-devel gdal-java gdal-libs gdal-python
--------------------------------------------------------------

(yum install python-grib_api.x86_64 grib_api-devel.x86_64 grib_api.x86_64) (optional)


##############################################
MAPSERVER:
On Centos 6.7 it's possible to install MapServer directly from the repository:
yum install mapserver


Typically the executable file is copied under "/usr/libexec/". Check it is an executable and rename it as "mapserv" in the "/var/www/cgi-bin" directory:
cp /usr/libexec/mapserver /var/www/cgi-bin/mapserv


Unluckly for Centos 7 this program is not accessible from the repository.
Then download the 6.0.4 version of MapServer from:
http://download.osgeo.org/mapserver/mapserver-6.0.4.tar.gz

Perhaps to activate certain option would be better install first:
yum install fribidi.x86_64 fribidi-devel.x86_64 cairo-devel.x86_64


Extract it:
tar -zxvf mapserver-6.0.4.tar.gz

and compile it:
./configure --with-gdal --with-proj --with-ogr --with-geos=/usr/bin/geos-config --with-wmsclient --with-wfs --with-wfsclient --with-sos --with-postgis=/usr/pgsql-9.3/bin/pg_config --with-xml2-config=/usr/bin/xml2-config --with-fastcgi=/usr/include/ --with-curl-config=/usr/bin/curl-config --with-wcs --with-cairo --with-fribidi
su root
make

Copy the executable file "mapserv" into the cgi-bin directory:
cp mapserv /var/www/cgi-bin/

Update the EPSG file to which also refers MapServer:
vi /usr/share/proj/epsg

Add in the header:
# WGS 84
<4326> +proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs  no_defs <>
# WGS 84 / UTM zone 32N
<32632> +proj=utm +zone=32 +datum=WGS84 +units=m +no_defs  <>
# ED50 / UTM zone 32N
#<23032> +proj=utm +zone=32 +ellps=intl +units=m +no_defs  no_defs <>
<23032> +proj=utm +zone=32 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs  <>
# Google Spherical Mercator
<900913> +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs <>
# Popular Visualisation CRS / Mercator
<3785> +proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs <>
# Popular Visualisation CRS / Mercator GoogleIt
<3875> +proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs <>


Install mapscript module for python:
pip install --proxy <proxy_host>:<proxy_port> mapscript
If any error, try:
CPPFLAGS="-I/home/iris_user/Documenti/mapserver-6.0.4 -I/usr/include/gdal" pip install --proxy proxy.arpa.piemonte.it:3128 mapscript

or compile from mapserver package:
cd ./mapserver-6.0.4/mapscript/python
python setup.py build
python setup.py install

or compile from source:
wget https://pypi.python.org/packages/8f/7d/92af154e6b0d99fec444ff6ea345faad7850fab4efd6c2a0cbe67566cf9c/mapscript-5.4.2.1.tar.gz -e use_proxy=yes -e http_proxy=http://<proxy_host>:<proxy_port>
tar -zxvf mapscript-5.4.2.1.tar.gz
cd mapscript-5.4.2.1


### to develop ###
Install Mapserver 6.4.5 with CMake:
Enter inside the Mapserver 6.4.5 directory. Then:

mkdir build
cd build
cmake -DCMAKE_PREFIX_PATH=/usr/pgsql-9.3/bin/pg_config:/usr/bin/geos-config:/usr/include:/usr/bin/curl-config:/usr/bin/xml2-config -DWITH_PYTHON=1 -DWITH_CLIENT_WMS=1 -DWITH_CLIENT_WFS=1 -DWITH_SOS=1 -DWITH_CURL=1 /home/meteo/mapserver-6.4.5
make
make install
ln -s /usr/local/bin/mapserv /var/www/cgi-bin/mapserv_645


### Generate a legend image for raster ###
Check this address:
http://IRIS_BASE_ADDRESS/cgi-bin/mapserv?map=/var/www/html/common/mapfiles/create_legend.map&SERVICE=WMS&VERSION=1.1.1&layer=legend_layer&mode=legend&FORMAT=image/png

Modify in an opportune way:
IMAGEURL '/common/mapfiles/tmp/'
SHAPEPATH '/var/www/html/common/mapfiles/legend_txt/'

And the INCLUDE txt inside the LAYER tag to set the class and colours, for example:
INCLUDE 'legend_txt/rainist_legend.txt'


##############################################
TINYOWS:
the tinyows_100 version is provided in the zip package, and should be compatible with your system.
However it is possible to download and compile it.
So download and compile tinyows-1.0.0rc4.tar.bz2 (it is by the way already provided in the package):
tar -xvf  tinyows-1.0.0rc4.tar.bz2
cd tinyows
./configure --with-pg_config=/usr/pgsql-9.3/bin/pg_config --with-xml2-config=/usr/bin/xml2-config
make
sudo make install

Then copy the file tinyows-demo.xml in /etc, rename as tinyows.xml, change the online address in the header and eventually the connection data, and make root its owner:
chown root:root /etc/tinyows.xml

Check for correct installation of Tinyows by running:
/var/www/cgi-bin/tinyows --check
--> if the DB it's already been recovered of its tables, the command above should return the active layers


### DEVELOPMENT ###
On Centos 7 it's possible to install the newer version 1.1.0.
The newer 110 version, however, has some polygon representation bugs not yet solved.
We therefore recommend the use of the older version 1.0.0rc4, which it is provided, without need to compile it, within the zip package.

We list below the commands to compile the newer version in the case these bugs will be resolved.

wget http://download.osgeo.org/mapserver/tinyows-1.1.0.tar.bz2
tar xvjf tinyows-1.1.0.tar.bz2
cd tinyows
./configure --with-pg_config=/usr/pgsql-9.3/bin/pg_config --with-xml2-config=/usr/bin/xml2-config
make
sudo make install

Move the executable file "tinyows" in "/var/www/cgi-bin".
If you will to mantain more version of tinyows, rename this executable in tinyows_110 to distinguish it.

### end of DEVELOPMENT ###


##############################################
SELINUX: Changes to allow connections to the DB and the http service
#check status:
getenforce
sestatus
#change status from enforcing to permissive - this change need a reboot:
vi /etc/sysconfig/selinux

To set a permissive mode without reboot the machine:
setenforce 0

To come back to a enforcing mode:
setenforce 1


To let the "enforcing" mode, modify only the "httpd" options. For example:
getsebool -a | grep httpd
setsebool -P httpd_can_network_connect_db on
setsebool -P httpd_can_network_connect on

setsebool -P httpd_tty_comm on
setsebool -P httpd_unified on
setsebool -P httpd_dbus_avahi on


To debug any problem occurred with SELinux install:
yum install setroubleshoot setools

Then to debug launch:
sealert -a /var/log/audit/audit.log



--------------------------------------------------------------
MODIFY FIREWALL RULES - for CENTOS 7 (for CentOs 6.7 you need to change IpTables rules, see further):
Enable SSH:
yum -y install openssh-server openssh-clients
service sshd start
chkconfig sshd on

Enable, start and check status of Firewalld, run the following command as root:
systemctl enable firewalld
systemctl start firewalld
systemctl status firewalld

Enable SSH:
firewall-cmd --permanent --zone=public --add-service=ssh
firewall-cmd --reload
firewall-cmd --zone=public --query-service=ssh
#To remove the port or service you added (in case):
firewall-cmd --zone=public --remove-service=ssh

Enable HTTPD:
firewall-cmd --permanent --zone=public --add-service=http
firewall-cmd --reload
#Verify the service port has been opened:
firewall-cmd --zone=public --query-service=http
#oppure:
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp

Enable POSTGRESQL:
firewall-cmd --permanent --zone=public --add-service=postgresql
firewall-cmd --reload
#Verify the service port has been opened:
firewall-cmd --zone=public --query-service=postgresql
#If not try:
firewall-cmd --zone=public --permanent --add-port=5432/tcp

#Reload the firewall configuration:
firewall-cmd --reload


MODIFY IPTABLES RULES - for CENTOS 6.7:
#Edit the file with the rules:
vi /etc/sysconfig/iptables
#Add HTTPD:
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT
#Add PostgreSQL:
-A INPUT -p tcp -m state --state NEW -m tcp --dport 5432 -j ACCEPT
#Add SSH:
-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT

Restart the service:
/etc/init.d/iptables restart
--------------------------------------------------------------


##############################################
START SERVICE and DB and APACHE
su root
service httpd start

For CentOS 7 the command to initialize the DB is:
/usr/pgsql-9.3/bin/postgresql93-setup initdb

For CentOS 6.7 the command to initialize the DB is:
service postgresql-9.3 initdb

And then in any case:
service postgresql-9.3 start

To start both services at startup:
chkconfig httpd on
chkconfig postgresql-9.3 on

Enter the psql console and modify the postgres's user password:
su postgres
psql
>>ALTER USER Postgres WITH PASSWORD 'XXXX';
>>\q
--update the login scripts to the DB with the pwd set for the "postgres" user, especially in the /etc/tinyows.xml file


Edit the file "/var/lib/pgsql/9.3/data/postgresql.conf" with:
listen_addresses = '*'

Edit "/var/lib/pgsql/9.3/data/pg_hba.conf" look similar to:
# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5


Restart the service to reload the modifications made above:
service postgresql-9.3 restart


##############################################
ENABLE FASTCGI SUPPORT - IN DEVELOPMENT!
First of all, check your php configuration, before and after this procedure to validate the FastCgi support. Create the file /var/www/html/info.php and write inside it:

<?php
  phpinfo();
?>

Check it on the browser at http://your_server/info.php. Look the value of Server API option: if at the end of this process it is set to "CGI/FastCGI",it means server is properly configured to use FastCGI.


Edit PHP configuration file for Apache (/etc/httpd/conf.d/php.conf) in your favorite text editor and comment following lines by adding the hash (#) sign at the start of the lines:

#<FilesMatch \.php$>
#    SetHandler application/x-httpd-php
#</FilesMatch>

Nagigate to /var/www/cgi-bin directory, If not exists create directory. Then create a php.fastcgi file and add the following content to this file. Also make sure the php.ini file and php-cgi exist on your system:

vim /var/www/cgi-bin/php.fastcgi

#!/bin/bash

PHPRC="/etc/php.ini"
PHP_FCGI_CHILDREN=4
PHP_FCGI_MAX_REQUESTS=1000
export PHPRC
export PHP_FCGI_CHILDREN
export PHP_FCGI_MAX_REQUESTS
exec /usr/bin/php-cgi


Change permissions of php.fastcgi script to make it executable by Apache server:

chown apache:apache /var/www/cgi-bin/php.fastcgi
chmod +x /var/www/cgi-bin/php.fastcgi


Finally, modify your Apache configuration file with FastCGI support inside the "<Directory "/var/www/html">":

vi /etc/httpd/conf/httpd.conf

Options +Indexes +FollowSymLinks +ExecCGI
AddHandler php-fastcgi .php
Action php-fastcgi /cgi-bin/php.fastcgi

--> source: https://tecadmin.net/setup-httpd-with-fastcgi-and-php-on-centos-redhat/


** Under Development **
To enable the FASTCGI support "mod_fcgid" to cgi-bin paths add to /etc/httpd/conf/httpd.conf:

<Directory "/var/www/cgi-bin">
	...
    SetHandler fcgid-script
	...
</Directory>

And eventually add the section:
<IfModule fcgid_module>
  AddHandler fcgid-script .fcgi # you can put whatever extension you want
</IfModule>


##############################################
SETUP DB POSTGRES: Some initial configurations:
su postgres
psql -c "CREATE EXTENSION adminpack;"  --to manage the server from PgAdmin

--for Windows:
createdb -T template0 -E utf8 -l american_usa postgis_template
--for Linux:
createdb -T template0 -E utf8 -l en_US.UTF-8 postgis_template

createlang plpgsql postgis_template

--To install the extensions you can access to psql console and then launch:
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

--or you can achieve the same results from shell:
cd /usr/pgsql-9.3/share/contrib/postgis-2.1/
psql -d postgis_template -f postgis.sql
psql -d postgis_template -f postgis_comments.sql
psql -d postgis_template -f spatial_ref_sys.sql
psql -d postgis_template -f rtpostgis.sql
psql -d postgis_template -f raster_comments.sql
psql -d postgis_template -f topology.sql
psql -d postgis_template -f topology_comments.sql

Enter the psql console:
CREATE ROLE radar_rw NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE webgis_r NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
CREATE ROLE idro_rw NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;

CREATE ROLE idro LOGIN ENCRYPTED PASSWORD 'XXXX' SUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
GRANT idro_rw TO idro;
GRANT webgis_r TO idro;
CREATE ROLE radar LOGIN ENCRYPTED PASSWORD 'XXXX' SUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
GRANT radar_rw TO radar;
GRANT webgis_r TO radar;
CREATE ROLE webgis LOGIN ENCRYPTED PASSWORD 'webgis$2013%' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
--if you change the "webgis" user's password you need to update the connection scripts to DB accordingly: best to leave the default password
GRANT webgis_r TO webgis;


##############################################
RESTORE DUMP DB "IRIS_BASE"
Unzip the zip file, then restore the DB from sql file.
Before launching the sql file, you must create the target DB "iris_base" on the server through the user postgres:
CREATE DATABASE iris_base WITH OWNER = postgres
	   TEMPLATE = postgis_template
       ENCODING = 'UTF8'  --maybe optional if default database is already in UTF8
       TABLESPACE = pg_default
       --LC_COLLATE = 'it_IT.UTF-8'  --maybe optional if default database is already in UTF8
       --LC_CTYPE = 'it_IT.UTF-8'  --maybe optional if default database is already in UTF8
       CONNECTION LIMIT = -1;
ALTER DATABASE iris_base SET search_path = "$user", public, topology;
COMMENT ON DATABASE iris_base IS 'configurazione minima per un sistema webgis generico';

Before to load the dump files and the demo data on iris_base DB the schemas need to be created:
/usr/pgsql-9.3/bin/psql -d iris_base -h localhost -U postgres -p 5432 -c "CREATE SCHEMA IF NOT EXISTS config AUTHORIZATION postgres; GRANT USAGE ON SCHEMA config TO public; GRANT USAGE ON SCHEMA config TO webgis_r; GRANT ALL ON SCHEMA config TO radar_rw; COMMENT ON SCHEMA config IS 'schema con tabelle di configurazione dei sistemi WebGis'; CREATE SCHEMA IF NOT EXISTS dati_di_base AUTHORIZATION postgres; GRANT USAGE ON SCHEMA dati_di_base TO public; GRANT USAGE ON SCHEMA dati_di_base TO webgis_r; GRANT ALL ON SCHEMA dati_di_base TO radar_rw; COMMENT ON SCHEMA dati_di_base IS 'Dati di base comuni ai servizi'; CREATE SCHEMA IF NOT EXISTS realtime AUTHORIZATION postgres; GRANT USAGE ON SCHEMA realtime TO public; GRANT USAGE ON SCHEMA realtime TO webgis_r; GRANT ALL ON SCHEMA realtime TO radar_rw; COMMENT ON SCHEMA realtime IS 'Raccolta dati in tempo reale';"

Then load the dump files and demo data:
/usr/pgsql-9.3/bin/psql -U postgres -d iris_base -f /home/iris_user/dump_db_iris_base_schema_config-v31_utf8.sql > error_restore_schema_config-v31.log 2>&1

/usr/pgsql-9.3/bin/psql -U postgres -d iris_base -f /home/iris_user/dump_db_iris_base_dati_demo-v3x_utf8.sql > error_restore_dati_demo-v3x.log 2>&1

/usr/pgsql-9.3/bin/psql -U postgres -d iris_base -c "\copy realtime.meteo_real_time FROM '/home/iris_user/dati_realtime_demo-v3x.csv';"

Create some core functions and triggers:
/usr/pgsql-9.3/bin/psql -d iris_base -h localhost -U postgres -p 5432 -f /home/iris_user/create_functions_and_triggers.sql > error_functions_triggers-v3x.log 2>&1

Then reset sequence and insert some demo value from the psql consolle:
/usr/pgsql-9.3/bin/psql -d iris_base -h localhost -U postgres -p 5432 -f /home/iris_user/reset_seq-load_demo_service.sql > error_reset_load-v3x.log 2>&1

At the end grant usage on schema topology to base user:
GRANT USAGE ON SCHEMA topology TO webgis_r;


/* Potential errors */
If database is not already in UTF8 we noticed some problem to create properly the plr and postgis extension. They might be added manually. So if restoring the dump gives you some ERROR messages, drop the database, recreate it and before restore the dump add the extension following these instrucitons:
psql -U postgres -d iris_base -f /usr/pgsql-9.3/share/extension/plr.sql
psql -d iris_base -U postgres -f /usr/pgsql-9.3/share/contrib/postgis-2.1/postgis.sql
psql -d iris_base -U postgres -f /usr/pgsql-9.3/share/contrib/postgis-2.1/spatial_ref_sys.sql
psql -d iris_base -U postgres -f /usr/pgsql-9.3/share/contrib/postgis-2.1/rtpostgis.sql
psql -d iris_base -U postgres -f /usr/pgsql-9.3/share/contrib/postgis-2.1/topology.sql

Also be sure that the dump sql file contains "UTF8" as encoding.


##############################################
INSTALL AND CONFIGURE PHPPGADMIN - Optional, for CentOS 7

yum install phpPgAdmin.noarch

Then configure phpPgAdmin as accessible from outside:
vi /etc/httpd/conf.d/phpPgAdmin.conf
Replace:
	Require local
with:
	Require all granted

Replace:
	Deny from all
with:
	Allow from all

If you want restrict the access rules to a range of IP, let "Deny from all", remove "Require all granted" or "Require local" and add:
	Allow from 10.127.0.0/12
	
Modify the config.inc.php file:
vi /etc/phpPgAdmin/config.inc.php

Find the line:
	$conf['servers'][0]['host'] = '';
Replace the line with:
	$conf['servers'][0]['host'] = 'localhost';

Find the line:
	$conf['owned_only'] = false;
Replace the line with:
	$conf['owned_only'] = true;

Reload PostgreSQL and httpd services:
service postgresql-9.3 restart
service httpd restart

Now you can visit phpPgAdmin from your browser: http://[YourServerIP]/phpPgAdmin/


##############################################
WEB CREATION ENVIRONMENT
Unzip the file "webgis_IRIS_BASE_<data_backup>.tar.gz" and put its content in the path "/var/www/".
So there will have the paths "/var/www/html" and "/var/www/cgi-bin" containing operating file within them.

Untar the file "webgis_IRIS_BASE_cgibin_20180206_v30.tar.gz" in the path "/var/www/cgi-bin/" as root, then if you prefere you could assign permission to the iris_user:
tar -xvzf webgis_IRIS_BASE_cgibin_20180206_v30.tar.gz


Untar the file "webgis_IRIS_BASE_html_librerie_20180206_v30.tar.gz" in the path "/var/www/html/" as root, then if you prefere you could assign permission to the iris_user:
tar -xvzf /tmp/webgis_IRIS_BASE_html_librerie_20180206_v30.tar.gz


Untar the file "webgis_IRIS_BASE_html_scripts_20180206_v30.tar.gz" in the path "/var/www/html/" as root. It is better to assign permission to the iris_user for these files and paths:
tar -xvzf /tmp/webgis_IRIS_BASE_html_scripts_20180206_v30.tar.gz


Manually create the following folders (some directories may already exist from the zip however):
su root
mkdir /var/www/html/common/DATA/raster/animation
mkdir /var/www/html/common/mapfiles/tmp
chown -R iris_user:iris_user /var/www/html/common/DATA/raster
chown -R iris_user:iris_user /var/www/html/common/mapfiles/tmp
chmod 777 /var/www/html/common/mapfiles/tmp

Change owners:
cd /var/www/html
chown -R apache:apache sencha-touch-1.1.1 OpenLayers-2.13.1 ol_v3.14.2-dist minify-2.1.7 jQuery Highstock-1.3.9 Highcharts-3.0.9 GXM-0.1 GeoExt ext-3.4.0 common flanis suncalc-master
chown -R iris_user:iris_user *.html *.png flanis iris_base common/*


Modify the files in an opportune way:
/var/www/cgi-bin/config.py
/var/www/html/common/config.php


Check the correct initialization of the web environment by visiting with a browser the page:
http://iris_base_address/common/pannello_generale.php

Check for Tinyows connection to data:
/var/www/cgi-bin/tinyows --check


##############################################
CONFIGURE HTTP.CONF TO MANAGE DIFFERENT WEB USERS
In order to protect the web content it's possible to setup users for specific path.

First create the users, storing their credentials in the files ".htpasswd" and ".htgroups".
For example to create the user "iris_user" with password "Ir1$" digit:
htpasswd /var/www/html/common/.htpasswd iris_user

To create the file .htpasswd for the first time:
htpasswd -n <user_name>

To add or update a new user to the file .htpasswd:
htpasswd /var/www/html/common/.htpasswd <user_name>

Then the system will ask you for the password.

To create a group, simply create a file called ".htgroups" and add the name of the group and the apache user member of it. For example (enclose names with spaces in quotes):
rupar: centrofunzionale iris_user


Done that, open the file "/etc/httpd/conf/httpd.conf".
At the end of the file, add the rows to set the directory you want to protect, for example:
<Directory /var/www/html/iris_base/>
	AllowOverride AuthConfig
	AuthName "Please insert your Login and Password"
	AuthType Basic
	AuthUserFile /var/www/html/common/.htpasswd
	AuthGroupFile /var/www/html/common/.htgroups
	require user iris_user guest
	#in this case the path is only accessible by the users "iris_user" and "guest"
</Directory>

Setup a path that any users (provided with login and password) could have access. For example:
<Directory /var/www/html/common/>
	AllowOverride AuthConfig
	AuthName "Please insert your Login and Password"
	AuthType Basic
	AuthUserFile /var/www/html/common/.htpasswd
	AuthGroupFile /var/www/html/common/.htgroups
	#require group rupar #in this case the entire group could have access to this path
	Require valid-user #in this case it's enough that the user is present in the .htpasswd file
</Directory>



##############################################
CREATING OPERATIONAL SCRIPTS
Unzip the file "script_IRIS_BASE_<data>.tar.gz" and put its content in the path "/home/iris_user/operativo".
Most likely you will have to create the following folder:
su iris_user
mkdir /home/iris_user/operativo



##############################################
WEB LOG ANALYZER - INSTALL GOACCESS
yum install goaccess.x86_64

to create the static file with web access statystic launch as root:
goaccess /var/log/httpd/access_log -o /var/www/html/report.html --log-format=COMBINED

To filter by IRIS service:
zgrep -h -i 'TYPE=<name_of_service>'  /var/log/httpd/access_log* | goaccess --html-report-title='IRIS <name_of_service>' -a -o /var/www/html/goaccess_reports/<name_of_service>-report.html --log-format=COMBINED

In this last example we have created the folder "goaccess_reports" under "/var/www/html".



##############################################
INSTALL AND CONFIGURE VERSIONING SOFTWARE: GIT

yum install git

git config --global user.name "StrumentazioneSC05"
git config --global user.email strumentazionesc05@gmail.com

git config --global http.proxy "http://proxy.arpa.piemonte.it:3128"
git config --global https.proxy "https://proxy.arpa.piemonte.it:3128"


To list the settings:
git config --list

To read the config file:
vi ~/.gitconfig

Enter in the path that you want versioning and initialize it - as root:
cd /var/www/
git init

Add paths and files that you want to version:
git add cgi-bin/*.py
git add html/*.png
git add html/*.html
git add html/iris_base
git add html/common/

To untrack a folder before to commit: it will stay in your work environment but Git will no longer track it
git rm -r --cached html/common/DATA/

To untrack a file: it will stay in your work environment but Git will no longer track it
git rm --cached readme.txt

If after a commit you made something wrong and you want start back:
git reset

If after a commit you just want untrack a folder:
git reset -- html/common/DATA/

To see the files in "staging" - waiting to be committed:
git diff --name-only --cached

or also to see which files are modified, tracked, etc::
git status

And finally commit:
git commit -m 'IRIS_BASE project version 3.0 - 10 feb 2018'


To see any changes made not yet committed:
git diff
This command compares what's in your working directory with what's in your stage area. The result shows your changes that you have not yet put on the stage.

If you want to see what's on the stage and that will be part of the next commit:
git diff --staged

See the various versions:
git log
One of the most useful options is -p, which shows the differences introduced by each commit. You can also use -2, which limits the output to the last two elements.

To come back to a previous commit:
git checkout <hash>
if you modify something i this area, you will not affect the last commit (the "master"), unless you don't create a branch from this point.
To come back to the last commit:
git checkout master

Create an alias to see the commits's HISTORY:
git config --global alias.hist 'log --pretty=format:"%h %ad | %s%d [%an]" --graph --date=short'

and then:
git hist


## TAG
TAG a version after a commit. List the existing tag and commits:
git tag
git log --pretty=oneline

and then associate the tag to the commit's checksum code:
git tag -a v3.0 -m 'IRIS_BASE version 3.0' cf504ca69721ef12c2056520a7e376a2f7ce9334

To show a specific version:
git show v3.0

To remove a TAG:
git tag -d v0.9



