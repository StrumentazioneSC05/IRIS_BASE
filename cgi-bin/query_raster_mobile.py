#!/usr/bin/python

"""
script che interroga i vari raster caricati sul progetto tramite libreria gdal
l'interrogazione avviene trmaite le coordinate cliccate su mappa e passate via url
"""

import os,sys
import cgi
import cgitb; cgitb.enable()
import commands
import pyproj
import pg
from datetime import datetime

import urllib
import simplejson
from unicodedata import normalize

reload(sys)
sys.setdefaultencoding('UTF-8')
#print sys.getdefaultencoding()

try:
    from osgeo import gdal
    from osgeo.gdalconst import *
    gdal.TermProgress = gdal.TermProgress_nocb
except ImportError:
    import gdal
    from gdalconst import *

try:
    import numpy as Numeric
    Numeric.arrayrange = Numeric.arange
except ImportError:
    import Numeric

fs = cgi.FieldStorage()

fmt = "%Y-%m-%d %H:%M"

p900913 = pyproj.Proj(init='epsg:3785')
p32632 = pyproj.Proj(init='epsg:32632')
p4326 = pyproj.Proj(init='epsg:4326')
p23032 = pyproj.Proj(init='epsg:23032')

infile = None
x = float(fs["x"].value)
y = float(fs["y"].value)
srid = str(fs["srid"].value)
webgis = str(fs["webgis"].value)
try:
    root_dir_html = str(fs["root_dir_html"].value)
except:
    root_dir_html = ''

print "Content-type:text/html\r\n\r\n"
print '<html>'
print '<head>'
print '<link rel="stylesheet" href="%s/jQuery/jquery-ui.css" />' % (root_dir_html)
print '<title>Precipitazione stimata</title>'

print '<style>body {font-family: Verdana,Arial,sans-serif;} h1 {font-size:1em;}</style>'
print '</head>'
print '<body>'

if srid == '900913':
	geo = "WGS84 Lon-Lat"
	x2, y2 = pyproj.transform(p900913,p4326,x,y)
	#geo1 = "WGS84 UTM32 X-Y"
	#x3, y3 = pyproj.transform(p900913,p32632,x,y)
elif srid == '32632':
	geo = "WGS84 Lon-Lat"
	x2, y2 = pyproj.transform(p32632,p4326,x,y)
	geo1 = "WGS84 UTM32 X-Y"
	x3, y3 = (x,y)

print "<h1>%s UTC / %8.3f %9.3f </h1>" % (datetime.strftime(datetime.now(),fmt), x2,y2)

#### PRELEVO IL COMUNE DI INTERSEZIONE ####
con_db1 = pg.connect(dbname='radar', host='localhost', user='webgis')
query_com = "select localita, provincia, regione, istat from dati_di_base.limiti_amministrativi where st_intersects(ST_Transform(ST_GeomFromText('POINT(%s %s)', %s), 32632), the_geom);" % (x, y, srid)
results_com = con_db1.query(query_com).getresult()
con_db1.close()

if results_com:
  print "<h1>Comune: <b> %s, %s (%s) \n</b></h1>" % (results_com[0][0], results_com[0][1], results_com[0][2])


### FUNZIONE PER PRELEVARE IL VALORE DALLA CELLA RASTER XY ###
def getvalue_from_raster(filename, pubname):
    """
    Dal nome del file completo di percorso assoluto
    tramite la chiamata di sistema gdallocationinfo si recupera
    il valore della cella x-y dal raster
    """
    indataset = gdal.Open(infileIDRO, GA_ReadOnly)
    if infileIDRO == None:
        print("<tr><td colspan='2' style='text-align:center;'>Cannot open</td></tr>", infileIDRO)
        return None, None
    dataIDRO = indataset.GetMetadata()['DATETIME']
    geomatrix = indataset.GetGeoTransform()
    # Read geomatrix matrix and calculate ground coordinates
    col = int((float(x) - geomatrix[0]) / geomatrix[1])
    row = int((float(y) - geomatrix[3]) / geomatrix[5])
    xmin=geomatrix[0]
    ymin=geomatrix[3]+indataset.RasterYSize*geomatrix[5]
    xmax=geomatrix[0]+indataset.RasterXSize*geomatrix[1]
    ymax=geomatrix[3]
    ext=[xmin,xmax,ymin,ymax]
    
    # Recuperiamo il valore della cella, e la stampiamo a video:
    if (x < xmin or x > xmax or y < ymin or y > ymax):
        print "<tr> <td>%s:</td> <td colspan='2' style='text-align:center;'>punto fuori dominio</td> </tr>" % (pubname)
        #sys.exit(1)
        #continue
        return None, None
    else:
        string = "/usr/bin/gdallocationinfo -valonly -geoloc %s %s %s" % (infileIDRO,x,y)
        valIDRO = commands.getstatusoutput(string)
        return valIDRO, dataIDRO


#### RASTER RADAR ####
#print "\nPrecipitazione istantanea stimata da radar (in mm/h):"

if srid == '900913':
  subsrid = "900913.tiff"
  subsrid2 = "3785.tiff"
  subsrid3 = "3875.tiff"
elif srid == '32632':
  subsrid = "32632.tiff"

#FAI IN MODO CHE LE TABELLE ABBIANO LA STESSA STRUTTURA!!!

#Tabella per il tipo di precipitazione:
table0 = [ [ 0 for i in range(1) ] for j in range(1) ]
table0[0] = ['googlemap_pioggia_neve_'+subsrid, 'Pioggia neve', 'mm', '9999']

#Tabella per la precipitazione istantanea da radar:
table1 = [ [ 0 for i in range(3) ] for j in range(4) ]
table1[0] = ['googlemap_ist_'+subsrid, 'Piemonte', 'mm/h', '9999']
table1[1] = ['googlemap_ist_bis_'+subsrid, 'Lema e Linate', 'mm/h', '9999']
#table1[2] = ['googlemap_composite_'+subsrid, 'Mosaico Nord-Ovest', 'mm/h', '9999']
table1[2] = ['googlemap_dpc_ist_'+subsrid, 'Mosaico naz. DPC', 'mm/h', '9999']
table1[3] = ['maxband_'+subsrid, 'Banda-X mobile (Vercelli)', 'mm/h', '9999']

#Tabella per la precipitazione cumulata da radar - aggiungo informazione sul tempo:
#table2 = [ [ 0 for i in range(4) ] for j in range(4) ]
table2 = [ [ 0 for i in range(4) ] for j in range(2) ]
table2[0] = ['googlemap_01h_'+subsrid, 'Pioggia 1h', 'mm', '60']
table2[1] = ['googlemap_03h_'+subsrid, 'Pioggia 3h', 'mm', '180']
#table2[2] = ['googlemap_06h_'+subsrid, 'Pioggia ultime 6h', 'mm', '360']
#table2[3] = ['googlemap_tot_'+subsrid, 'Pioggia da ieri', 'mm', '1440']

#Tabella per dati MeteoSat:
table1b = [ [ 0 for i in range(3) ] for j in range(4) ]
table1b[0] = ['clm_bt_'+subsrid, 'Temperatura nube', ' &deg;C', '9999']
table1b[1] = ['clm_cp_'+subsrid, 'Altezza nube', ' km', '9999']
table1b[2] = ['clm_type_'+subsrid, 'Tipo di nube', ' ', '9999']
table1b[3] = ['clm_phase_'+subsrid, 'Fase della nube', ' ', '9999']

#Tabella per la precipitazione cumulata da rete a terra:
#table4 = [ [ 0 for i in range(4) ] for j in range(5) ]
table4 = [ [ 0 for i in range(4) ] for j in range(2) ]
table4[0] = ['PLUV_ultima_ora'+subsrid2, 'Pioggia 1h', 'mm', '60']
table4[1] = ['PLUV_ultime_3ore'+subsrid2, 'Pioggia 3h', 'mm', '180']
#table4[2] = ['PLUV_ultime_6ore'+subsrid2, 'Pioggia ult. 6ore', 'mm', '360']
#table4[3] = ['PLUV_ultime_12ore'+subsrid2, 'Pioggia ult. 12ore', 'mm', '720']
#table4[4] = ['PLUV_ultime_24ore'+subsrid2, 'Pioggia ult. 24ore', 'mm', '1440']

#Tabella per la neve fresca / neve al suolo:
table3 = [ [ 0 for i in range(3) ] for j in range(3) ]
table3[0] = ['piemonte_kriging_Hn'+subsrid3, 'Neve fresca', 'cm', '9999']
table3[1] = ['piemonte_kriging_Hn_3gg'+subsrid3, 'Neve fresca 3gg', 'cm', '9999']
table3[2] = ['piemonte_kriging_Hs'+subsrid3, 'Neve al suolo', 'cm', '9999']


#Ciclo dentro le righe della tabella e prelevo il valore della cella raster:
def inside_rows(row_xx, infile_path):
    global fname_pub, infileIDRO, fname, unita, valIDRO, dataIDRO, durata_pioggia
    fname = row_xx[0]
    fname_pub = row_xx[1]
    unita = row_xx[2]
    durata_pioggia = row_xx[3] #in minuti
    infileIDRO = infile_path + fname
    valIDRO, dataIDRO = getvalue_from_raster(infileIDRO, fname_pub)
    return (fname, fname_pub, unita, valIDRO, dataIDRO, durata_pioggia)


#Elaboro il tipo di precipitazione:
def precipitazione(infile_path):
  #print "<div id='tabs-1'>"
  for row in table0:
      inside_rows(row, infile_path)

      if valIDRO==None:
        continue

      tdataIDRO = datetime.strptime(dataIDRO,fmt)
      deltat = (datetime.now() - tdataIDRO).seconds / 60.

      if deltat > 20:
        print "<h1>Tipo di prec.: <b>n.d. (rit = %i min)</b></h1>" % (deltat)
        continue

      if (valIDRO[1] != 'nan'):
        n = int(valIDRO[1])
        #Decodifico il valore in stringa:
        if n == 0:
            print "<h1><b>nessuna prec.</b></h1>"
        elif n == 1:
            print "<h1><b>pioggia debole</b></h1>"
        elif n == 2:
            print "<h1><b>pioggia moderata</b></h1>"
        elif n == 3:
            print "<h1><b>pioggia forte</b></h1>"
        elif n == 4:
            print "<h1><b>pioggia molto forte</b></h1>"
        elif n == 5:
            print "<h1><b>neve debole</b></h1>"
        elif n == 6:
            print "<h1><b>neve moderata</b></h1>"
        elif n == 7:
            print "<h1><b>neve forte</b></h1>"
        elif n == 8:
            print "<h1><b>neve mista pioggia debole</b></h1>"
        elif n == 9:
            print "<h1><b>neve mista pioggia moderata</b></h1>"
        elif n == 10:
            print "<h1><b>neve mista pioggia forte</b></h1>"
        elif n == 11:
            print "<h1><b>grandine mista pioggia</b></h1>"
        elif n == 12:
            print "<h1><b>grandine</b></h1>"
        elif n > 12:
            print "<h1><b>n.d.</b></h1>"
        else:
            print "<h1><b>nessuna prec.</b></h1>"
      else:
        print "<h1><b>n.d.</b></h1>"


#Elaboro la precipitazione istantanea:
  print "<h1>\nIST.radar(mm/h):<table>"
  for row in table1:
        if webgis == 'arpalombardia_mobile':
          stop_raster = ["_composite_", "p_ist_"+subsrid]
          if ("_composite_" in row[0] or "p_ist_"+subsrid in row[0]):
            continue
	elif webgis == 'thefloatingpiers_mobile':
          stop_raster = ["_composite_", "_ist_bis", "_dpc_ist"]
          if ("_composite_" in row[0] or "_ist_bis" in row[0] or "_dpc_ist" in row[0]):
            continue

        inside_rows(row, infile_path)

        if valIDRO==None:
            continue

        val=round(float(valIDRO[1]),1)

	tdataIDRO = datetime.strptime(dataIDRO,fmt)
	deltat = (datetime.now() - tdataIDRO).seconds / 60.
	if deltat < 30:
	   colorname = 'black'
	elif deltat < 45:
	   colorname = 'darkorange'
	else:
	   colorname = 'red'
        date_time_obj = datetime.strptime(dataIDRO, "%Y-%m-%d %H:%M")
	print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s</td> </tr>" % (colorname, fname_pub, val, date_time_obj.strftime("%d/%m/%y %H:%M"))
	#fname2 = os.path.basename(fname)
  print "</table></h1>"


#Elaboro la precipitazione cumulata:
  if (webgis == 'arpalombardia_mobile' or webgis == 'thefloatingpiers_mobile'):
    #print "</div>"
    return
  print "<h1>\nCUM.radarPIEM(mm):<table>"
  radar_prec=[]
  for row in table2:
        inside_rows(row, infile_path)
        if valIDRO==None:
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 30:
           colorname = 'black'
        elif deltat < 45:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        date_time_obj = datetime.strptime(dataIDRO, "%Y-%m-%d %H:%M")
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),1), date_time_obj.strftime("%d/%m/%y %H:%M"))
        #fname2 = os.path.basename(fname)

        #Creo una variabile da poter passare allo script php che costruisce i grafici sui tempi di ritorno confrontandoli con la precipitazione stimata da radar:
        prec = "%s,%s" % (durata_pioggia, round(float(valIDRO[1]),1))
        radar_prec.append(prec)

  global radar_arr
  radar_arr = '@@'.join(radar_prec)
  #60,8.2@@180,11.4@@360,11.4@@999,11.9
  #print radar_arr

  print "</table></h1>"


#  print "</div>"

"""
### DATI METEOSAT ###
def meteosat(infile_path):
  print "<div id='tabs-4'>"

  if srid == '900913':
        subsrid = "900913.tiff"
  elif srid == '32632':
        subsrid = "32632.tiff"

  print "<h1>\nCaratteristiche della nube:<table>"
  for row in table1b:
        inside_rows(row, infile_path)
        if valIDRO==None:
            continue

        if ("clm_bt_" in fname):
            val=round((float(valIDRO[1]) - 273.15),1)
            if val < -73:
               val = "--"
        elif ("clm_cp_" in fname):
            val=round((float(valIDRO[1]) / 10.),1)
            if val > 25.0:
               val = "--"
        elif ("clm_phase_" in fname):
            val=int(valIDRO[1])
            if (val==3):
               val='Acqua'
            elif (val==4):
               val='Probabile acqua'
            elif (val==5):
               val='Probabile ghiaccio'
            elif (val==6):
               val='Ghiaccio'
            else:
               val='--'
        elif ("clm_type_" in fname):
            val=int(valIDRO[1])
            if (val==3):
               val='Strato o nebbia'
            elif (val==4):
               val='Nube bassa'
            elif (val==5):
               val='Nube media'
            elif (val==6):
               val='Nube alta'
            elif (val==7):
               val='Nube molto alta'
            elif (val==8):
               val='Cirro sottile'
            elif (val==9):
               val='Cirro spesso'
            elif (val==10):
               val='Cirro su strati'
            elif (val==11):
               val='Nubi irregolari'
            else:
               val='--'
        else:
            val=round(float(valIDRO[1]),1)


        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 60:
           colorname = 'black'
        elif deltat < 75:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        date_time_obj = datetime.strptime(dataIDRO, "%Y-%m-%d %H:%M")
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s%s &nbsp </td> <td>%s</td> </tr>" % (colorname, fname_pub, val, unita, date_time_obj.strftime("%d/%m/%y %H:%M"))


        #fname2 = os.path.basename(fname)
  print "</table></h1>"


  print "</div>"
"""

#### DATI RASTER IDRO ####
def raster_idro(infile_path):
  #print "<div id='tabs-2'>"

  rete_prec=[]

  print "<h1>\nPrec. cumulata da rete (mm):<table>"
  for row in table4:
        inside_rows(row, infile_path)
        if valIDRO==None:
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 60:
           colorname = 'black'
        elif deltat < 75:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        date_time_obj = datetime.strptime(dataIDRO, "%Y-%m-%d %H:%M")
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),1), date_time_obj.strftime("%d/%m/%y %H:%M"))
        #fname2 = os.path.basename(fname)

        #Creo una variabile da poter passare allo script php che costruisce i grafici sui tempi di ritorno confrontandoli con la precipitazione rilevate da rete a terra:
        prec = "%s,%s" % (durata_pioggia, round(float(valIDRO[1]),1))
        rete_prec.append(prec)

  global rete_arr
  rete_arr = '@@'.join(rete_prec)
  #60,8.2@@180,11.4@@360,11.4@@999,11.9
  #print rete_arr

  print "</table></h1>"
  #print '</div>'


### DATI NEVE ###
def neve(infile_path):
  #print "<div id='tabs-3'>"

  print "<h1>\nAltezze neve (cm):<table>"
  for row in table3:
        inside_rows(row, infile_path)
        if valIDRO==None:
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 1440:
           colorname = 'black'
        elif deltat < 2160:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        date_time_obj = datetime.strptime(dataIDRO, "%Y-%m-%d %H:%M")
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %d &nbsp </td> <td>%s</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),0), date_time_obj.strftime("%d/%m/%y %H:%M"))
        #fname2 = os.path.basename(fname)
  print "</table></h1>"
  #print '</div>'


#A questo punto creo i vari TAB a seconda del tipo di webgis:
#print "<div id='tabs'>"
if webgis=='expo2015' or webgis=='expo2015_pub' or webgis=='arpalombardia_mobile':
    #print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    precipitazione("/var/www/html/common/DATA/raster/")
    #meteosat("/var/www/html/common/DATA/raster/")
elif webgis=='thefloatingpiers_mobile':
    precipitazione("/var/www/html/common/DATA/raster/")
else:
    #print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li><li><a href='#tabs-3'>Neve-rete a terra</a></li><li><a href='#tabs-5'>Atlante piogge</a></li></ul>"
    precipitazione("/var/www/html/common/DATA/raster/")
    #meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
    neve("/var/www/html/common/DATA/nivo/")
    #atlante()

#print '</div>'
#chiusura del div principale per la creazione dei TAB jQuery

print '</body>'
print '</html>'

