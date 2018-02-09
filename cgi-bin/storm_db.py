#!/usr/bin/python

import os,sys
import cgi
import cgitb; cgitb.enable()
import pgdb

# set HOME environment variable to a directory the httpd server can write to
os.environ[ 'HOME' ] = '/tmp/'
os.environ[ 'MPLCONFIGDIR' ] = '/tmp/'

import matplotlib
# chose a non-GUI backend
matplotlib.use( 'Agg' )

from pylab import *

code=[]
ora=[]
t=[]
zmean=[]
zmax=[]
tmin=[]
top=[]
vil=[]
poh=[]
si=[]
vv=[]
dd=[]

##
## versione produzione
##
# database server hostname
in_dsn = '127.0.0.1:radar'
# user
#in_user = 'radar'
in_user = 'webgis'
# password
#in_password = 'radar09'
in_password = 'webgis$2013%'


fs = cgi.FieldStorage()

db_Connect = pgdb.connect(dsn=in_dsn, user=in_user, password=in_password)
cursor = db_Connect.cursor ()

p = "SELECT coalesce(lunghezza,'-9999') FROM realtime.g_stormpath_lema where id = '%s'" % fs["id"].value 
cursor.execute (p)

path = cursor.fetchone()

s = "SELECT substr, lifetime, coalesce(mean,'-9999'),coalesce(max,'-9999'), coalesce(tmin,'-9999'),coalesce(top,'-9999'), coalesce(vil,'-9999'), coalesce(poh,'-9999'), coalesce(si,'-9999'), coalesce(vv,'-9999'), coalesce(dd,'-9999') FROM realtime.g_dbstorm_oggi where id = '" + fs["id"].value + "' ORDER BY lifetime ASC;"
#s = "SELECT * FROM realtime.g_dbstorm where id = '2011090400500169'"
cursor.execute (s)

rows = cursor.fetchall()

for row in rows:
	ora.append(row[0][0:2] + ':' + row[0][2:4])
	t.append(int(row[1]))
	zmean.append(float(row[2]))
	zmax.append(float(row[3]))
	tmin.append(float(row[4]))
	top.append(float(row[5])/10.)
	vil.append(float(row[6]))
	poh.append(float(row[7]))
	si.append(float(row[8]))
	vv.append(float(row[9]))
	dd.append(float(row[10]))

cursor.close()

if max(t) < 5:

	#titolo=fs["id"].value[0:8] + " dalle ore " + fs["id"].value[8:10] + ":" + fs["id"].value[10:12] + ' alle ' + ora[-1] + '\n\n Lifetime = ' + str(t[-1]) + ' min Dist = ' + str(round(path[0] / 1000., 1)) + ' km\nVel_ult = ' + str(vv[-1]) + ' km/h Dir_ult = ' + str(int(round(dd[-1],0))) + ' deg.\n'
	titolo=fs["id"].value[0:8] + " dalle ore " + fs["id"].value[8:10] + ":" + fs["id"].value[10:12] + ' alle ' + ora[-1] 
	print "Content-type: text/plain\n"
	print "\n %s\n" % (titolo)
	print "\n lifetime = %5.1f min" % (t[0])
	print "\n SI = %5.1f " % (si[0])
	print "\n zmax = %5.1f dBZ" % (zmax[0])
	print "\n zmean = %5.1f dBZ" % (zmean[0])
	print "\n tmin = %5.1f gradi" % (tmin[0])
	print "\n top = %5.1f km" % (top[0])
	print "\n vil = %5.1f g/kg" % (vil[0])
	print "\n poh = %5.1f perc." % (poh[0])
	print "\n vv = %5.1f m/s" % (vv[0])
	print "\n dd = %5.1f deg." % (dd[0])


else:

	#titolo = fs["id"].value[0:8] + " dalle ore " + fs["id"].value[8:10] + ":" + fs["id"].value[10:12] + ' alle ' + ora[-1] + '\n\n'

	titolo=fs["id"].value[0:8] + " dalle ore " + fs["id"].value[8:10] + ":" + fs["id"].value[10:12] + ' alle ' + ora[-1] + '\n\n Lifetime = ' + str(t[-1]) + ' min Dist = ' + str(round(path[0] / 1000., 1)) + ' km\nVmed = ' + str(round(path[0] / (1000. * t[-1]) * 60.,1)) + ' km/h\n Vel_ult = ' + str(vv[-1]) + ' km/h Dir_ult = ' + str(int(round(dd[-1],0))) + ' deg.\n'

	matplotlib.rcParams['axes.unicode_minus'] = False
	fig = figure(figsize=(7,12))
	subplots_adjust(hspace=0.2)

	ax0 = fig.add_subplot(611)
	ax0.plot(t,si, lw=1, alpha=0.7, mfc='orange')
	ax0.set_ylim([0,6])
	ax0.set_title(titolo)
	ax0.set_ylabel('Storm Severity Index')
	ax0.grid(True)

	ax1 = fig.add_subplot(612)
	ax1.plot(t,zmean, 'b',t,zmax,'r',lw=1, alpha=0.7, mfc='orange')
	ax1.set_ylim([35,70])
	ax1.set_ylabel('Refl. [dBZ]')
	ax1.grid(True)

	ax2 = fig.add_subplot(613, sharex=ax1)
	ax2.plot(t,tmin, 'g', lw=1, alpha=0.7, mfc='orange')
	ax2.set_ylim(ax2.get_ylim()[::-1]) 
	ax2.set_ylabel('Temp [C]')
	ax2.grid(True)

	ax3 = fig.add_subplot(614, sharex=ax1)
	ax3.plot(t,top, lw=1, alpha=0.7, mfc='orange')
	ax3.set_ylabel('Top [km]')
	ax3.grid(True)

	ax4 = fig.add_subplot(615, sharex=ax1)
	ax4.plot(t,vil, lw=1, alpha=0.7, mfc='orange')
	ax4.set_ylabel('Vil [kg/m2]')
	ax4.grid(True)

	ax5 = fig.add_subplot(616, sharex=ax1)
	ax5.plot(t,poh, lw=1, alpha=0.7, mfc='orange')
	ax5.set_ylabel('POH [%]')
	ax5.set_ylim([0,100])
	ax5.set_xlabel('lifetime [min]')
	ax5.grid(True)

#xticklabels = ax1.get_xticklabels()+ax2.get_xticklabels()
#setp(xticklabels, visible=False)

	print "Content-Type: image/png\n"

# save the plot as a png and output directly to webserver
	plt.savefig( sys.stdout, format='png' )

