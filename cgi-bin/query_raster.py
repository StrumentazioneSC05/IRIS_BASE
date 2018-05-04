#!/usr/bin/python

"""
script che interroga i vari raster caricati sul progetto tramite libreria gdal
l'interrogazione avviene trmaite le coordinate cliccate su mappa e passate via url
"""

from config import *

import os,sys
import cgi
import cgitb; cgitb.enable()
import commands
import pyproj
import pg
from datetime import datetime
import time

import urllib2
import simplejson
from unicodedata import normalize

reload(sys)
sys.setdefaultencoding('UTF-8')
#print sys.getdefaultencoding()

#dopo un aggiornamento son costretto, per evitare errori, ad importare mapscript prima delle gdal
import mapscript

try:
    from osgeo import gdal
    from osgeo.gdalconst import *
    gdal.TermProgress = gdal.TermProgress_nocb
except ImportError:
    import gdal
    from gdalconst import *
# this allows GDAL to throw Python Exceptions
gdal.UseExceptions()

try:
    import numpy as Numeric
    Numeric.arrayrange = Numeric.arange
except ImportError:
    import Numeric

opener = urllib2.build_opener(urllib2.ProxyHandler(proxies))
urllib2.install_opener(opener)


fs = cgi.FieldStorage()

fmt = "%Y-%m-%d %H:%M"
fmt_2 = "%Y%m%d%H%M"

p900913 = pyproj.Proj(init='epsg:3785')
p32632 = pyproj.Proj(init='epsg:32632')
p4326 = pyproj.Proj(init='epsg:4326')
p23032 = pyproj.Proj(init='epsg:23032')

infile = None
try:
  x = float(fs["x"].value)
  y = float(fs["y"].value)
  srid = str(fs["srid"].value)
except:
  print "Coordinate and SRID necessary"
  #x = 1084665
  #y = 5634526
  #srid = '900913'

if srid == '900913':
  geo = "WGS84 Lon-Lat"
  x2, y2 = pyproj.transform(p900913,p4326,x,y)
  geo1 = "WGS84 UTM32 X-Y"
  x3, y3 = pyproj.transform(p900913,p32632,x,y)
elif srid == '32632':
  geo = "WGS84 Lon-Lat"
  x2, y2 = pyproj.transform(p32632,p4326,x,y)
  geo1 = "WGS84 UTM32 X-Y"
  x3, y3 = (x,y)

try:
  webgis = str(fs["webgis"].value)
except:
  print "Webgis type necessary"

try:
    root_dir_html = str(fs["root_dir_html"].value)
except:
    root_dir_html = ''
#recupero le funzioni da attivare da url e dunque dal tipo di webgis configurato a livello di DB:
active_queries_url = fs["active_queries"].value
#active_queries_url = '13A'
try:
    active_queries = int(active_queries_url)
    stop_google = None
except:
    #SVILUPPO: provo a mettere una LETTERA al fondo se voglio ESCLUDERE TUTTA LA PAPPARDELLA sul richiamo del comune etc che prende tempo e in alcuni casi NON SERVE
    active_queries = int(active_queries_url[:-1])
    stop_google = active_queries_url[-1]
#active_queries_list = active_queries.split(',')

print "Content-type:text/html\r\n\r\n"
print '<html>'
print '<head>'
#print '<link rel="stylesheet" type="text/css" href="/common/mystyle.css">'

print '<link rel="stylesheet" href="%s/jQuery/jquery-ui.css" />' % (root_dir_html)
print '<title>Precipitazione stimata</title>'
print '<script src="%s/jQuery/jquery-1.10.2.js"></script>' % (root_dir_html)
print '<script src="%s/jQuery/jquery-ui.js"></script>' % (root_dir_html)
print '<script type="text/javascript" src="%s/common/proj4js-combined.js"></script>' % (root_dir_html)

print '<script>$(function() {$("#tabs").tabs();});</script>'

print '</head>'
print '<body>'
print '<style>body {font-family: Verdana,Arial,sans-serif;} h1 {font-size:1em;}</style>'


def mostra_dataora():
  print "<h1>Data e ora: %s UTC</h1>" % (datetime.strftime(datetime.now(),fmt))


def converti_coordinate():
  print '<script type="text/javascript">'
  #Qlke definizione di javascript:
  print 'Proj4js.defs["epsg:23032"] = "+proj=utm +zone=32 +ellps=intl +units=m +no_defs";'
  print 'Proj4js.defs["epsg:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";'
  print 'Proj4js.defs["epsg:900913"]= "+title= Google Mercator EPSG:900913 +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";'
  print 'var proj4326 = new Proj4js.Proj("epsg:4326"); //LatLon WGS84'
  print 'var proj4326dd = new Proj4js.Proj("epsg:4326"); //LatLon WGS84'
  print 'var proj4230 = new Proj4js.Proj("epsg:4230"); //LatLon ED50'
  print 'var proj4230dd = new Proj4js.Proj("epsg:4230"); //LatLon ED50'
  print 'var proj32632 = new Proj4js.Proj("epsg:32632"); //UTM32N WGS84'
  print 'var proj23032 = new Proj4js.Proj("epsg:23032"); //UTM32N ED50'
  print 'var proj3785 = new Proj4js.Proj("epsg:900913"); //UTM Google 900913'
  print 'function ConvertDDToDMS(D){'
  print 'return [0|D, "d", 0|(D<0?D=-D:D)%1*60, "\'", (0|D*60%1*6000)/100, \'"\'].join("");'
  print '}'
  print 'var x=%f' % (x)
  print 'var y=%f' % (y)
  print 'function convert_srid(new_srid) {'
  print 'var x=%f' % (x)
  print 'var y=%f' % (y)
  print 'var p1 = new Proj4js.Point(x, y);'
  print 'var pp1 = Proj4js.transform(proj3785, eval(new_srid), p1);'
  print 'var x_center = pp1.x; var y_center = pp1.y;'
  print 'if (new_srid=="proj32632" || new_srid=="proj23032") $("#coords").text(x_center.toFixed(0) + " " + y_center.toFixed(0));'
  print 'else if (new_srid=="proj4326dd" || new_srid=="proj4230dd") $("#coords").text(ConvertDDToDMS(x_center) + " " + ConvertDDToDMS(y_center));'
  print 'else $("#coords").text(x_center.toFixed(5) + " " + y_center.toFixed(5));'
  print '}'
  print '</script>'

  select_tag = '<select id="srid" onChange="convert_srid(this.value)"> <option value="proj4326">WGS84 Lon/Lat</option> <option value="proj4326dd">WGS84 Lon/Lat DMS</option> <option value="proj32632">WGS84 UTM32N</option> <option value="proj4230">ED50 Lon/Lat </option><option value="proj4230dd">ED50 Lon/Lat DMS</option> <option value="proj23032">ED50 UTM32N</option> </select>'

  print "<h1><span id='choose_srid'> &nbsp %s &nbsp &nbsp &nbsp</span><span id='coords'> %8.5f   %9.5f &nbsp</span></h1>" % (select_tag,x2,y2)
  #print "<h1>%s: %8.0f   %9.0f   </h1>" % (geo1,x3,y3)



def info_google():
  try:
    BASE_URL='https://maps.google.com/maps/api/elevation/json'
    gurl=BASE_URL+"?locations="+str(y2)+","+str(x2)
    response=simplejson.load(urllib2.urlopen(gurl))
    elev=max(0,round(response['results'][0]['elevation'],0))
    res =round(response['results'][0]['resolution'],0)
    err = ""
  except Exception as e:
    elev=-999
    res=-999
    err = str(e)


  ### Localita' - reverse geooding ###

  ## Usando MAPZEN: deprecato da febbraio 2018
  '''
  try:
    BASE_URL='https://search.mapzen.com/v1/reverse?api_key=mapzen-RWs47YQ'
    url=BASE_URL+"&point.lat="+str(y2)+"&point.lon="+str(x2)+'&size=1'
  #  print "<h1>Localita': <b> n.d. %s m asl %s </b>" % url,proxies
    response=simplejson.load(urllib2.urlopen(url))
    loc = response['features'][0]['properties']['label']
    print "<h1>Localita': <b> %s\n</b> @%d m asl (dem = %d m)</h1>" % (loc, elev,res)
  except:
    print "<h1>Localita': <b> n.d. %s m asl </b>" % url
  '''

  ## Usando GOOGLE:
  try:
    BASE_URL='https://maps.google.com/maps/api/geocode/json?key=&'
    url=BASE_URL+'latlng='+str(y2)+","+str(x2)
    response=simplejson.load(urllib2.urlopen(url))
    loc = response['results'][0]['formatted_address']
    print "<h1>Localita': <b> %s\n</b> @%d m asl (dem = %d m)</h1>" % (loc, elev,res)
  except Exception as e:
    print e
    print "<h1>Localita': <b> n.d. %s m asl </b>" % url


  #try:
  #  #BASE_URL = 'http://open.mapquestapi.com/nominatim/v1/search?format=json';
  #  BASE_URL='http://maps.googleapis.com/maps/api/geocode/json'
  #  url=BASE_URL+"?latlng="+str(y2)+","+str(x2)
  #  response=simplejson.load(urllib2.urlopen(url))
  #  #loc = response[0]['display_name'].split(',')
  #  loc = response['results'][0]['formatted_address'].split(',')
  #  #print "<h1>Localita': <b> %s - %s\n</b></h1>" % (loc[0].encode('ascii', 'replace'), loc[1].encode('ascii', 'replace'))
  #  #print "<h1>Localita': <b> %s - %s\n</b></h1>" % (normalize('NFD', loc[0].decode('latin-1')), loc[1])
  #  print "<h1>Localita': <b> %s - %s\n</b> @%d m asl (dem = %d m)</h1>" % (loc[0].decode('UTF-8'), loc[1].decode('UTF-8'), elev,res)
  #except:
  #  print "<h1>Localita': <b> n.d. %s m asl </b>" % url


def info_db():
  #### PRELEVO IL COMUNE DI INTERSEZIONE ####
  con_db1 = pg.connect(dbname=db_name, host=db_host, user=db_user, passwd=db_pwd)
  query_com = "select localita, provincia, regione, coalesce(istat,'-'), coalesce(to_char(popolazione,'99,999,999'),'-') from dati_di_base.limiti_amministrativi where st_intersects(ST_Transform(ST_GeomFromText('POINT(%s %s)', %s), 32632), the_geom);" % (x, y, srid)
  results_com = None
  try:
    results_com = con_db1.query(query_com).getresult()
  except Exception as e:
    print str(e)
  finally:
    con_db1.close()

  if results_com:
    print "<h1>Comune: <b> %s, %s (%s) &nbsp ISTAT: %s Abitanti: %s \n</b></h1>" % (results_com[0][0], results_com[0][1], results_com[0][2], results_com[0][3], results_com[0][4])


#A seconda della variabile stop_google scelgo quali informazioni mostrare nell'INTESTAZIONE
if stop_google == None:
  mostra_dataora()
  converti_coordinate()
  info_google()
  info_db()
elif stop_google == 'A':
  #mostra_dataora()
  pass



### FUNZIONE PER PRELEVARE IL VALORE DALLA CELLA RASTER XY ###
def getvalue_from_raster(filename, pubname):
    """
    Dal nome del file completo di percorso assoluto
    tramite la chiamata di sistema gdallocationinfo si recupera
    il valore della cella x-y dal raster
    """
    #messaggio_errore viene riportato nella console.log di js
    messaggio_errore = "Cannot open %s" % (filename)
    try:
        indataset = gdal.Open(filename, GA_ReadOnly)
    except:
	print "<tr> <td> %s </td> <td colspan='2' style='text-align:center;'> n.d. </td> </tr>" % (pubname)
	return None, messaggio_errore
    if filename== None:
        print("<tr><td colspan='2' style='text-align:center;'>Cannot open</td></tr>", filename)
        return None, messaggio_errore

    messaggio_errore = "Cannot get metadata DATETIME"
    try:
        dataIDRO = indataset.GetMetadata()['DATETIME']
    except:
        return None, messaggio_errore
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
        string = "/usr/bin/gdallocationinfo -valonly -geoloc %s %s %s" % (filename,x,y)
        valIDRO = commands.getstatusoutput(string)
        return valIDRO, dataIDRO


#### RASTER RADAR ####

#print "\nPrecipitazione istantanea stimata da radar (in mm/h):"

if srid == '900913':
  subsrid = "900913.tiff"
  subsrid2 = "3785.tiff"
  subsrid3 = "3875.tiff"
  subsrid4 = "3857.tiff"
elif srid == '32632':
  subsrid = "32632.tiff"

#infile_path = "/var/www/html/common/DATA/raster/"

#FAI IN MODO CHE LE TABELLE ABBIANO LA STESSA STRUTTURA!!!

#Tabella per il tipo di precipitazione:
table0 = [ [ 0 for i in range(1) ] for j in range(1) ]
table0[0] = ['googlemap_pioggia_neve_'+subsrid, 'Tipo di precipitazione', 'mm', '9999']

#Tabella per la precipitazione istantanea da radar:
table1 = [ [ 0 for i in range(3) ] for j in range(5) ]
table1[0] = ['googlemap_ist_'+subsrid, 'Mosaico piemontese', 'mm/h', '9999']
table1[1] = ['googlemap_ist_bis_'+subsrid, 'Mosaico Nord-Ovest', 'mm/h', '9999'] #con Lema e Linate
table1[2] = ['googlemap_composite_'+subsrid, 'Mosaico Nord-Italia', 'mm/h', '9999']
table1[3] = ['googlemap_dpc_ist_'+subsrid, 'Mosaico Italia', 'mm/h', '9999']
table1[4] = ['xband_'+subsrid, 'Banda-X mobile (Vercelli)', 'mm/h', '9999']

#Tabella per la precipitazione cumulata da radar - aggiungo informazione sul tempo:
table2 = [ [ 0 for i in range(4) ] for j in range(4) ]
table2[0] = ['googlemap_01h_'+subsrid, 'Pioggia ultima 1h', 'mm', '60']
table2[1] = ['googlemap_03h_'+subsrid, 'Pioggia ultime 3h', 'mm', '180']
table2[2] = ['googlemap_06h_'+subsrid, 'Pioggia ultime 6h', 'mm', '360']
table2[3] = ['googlemap_tot_'+subsrid, 'Pioggia da ieri', 'mm', '1440']

#Tabella per dati MeteoSat:
table1b = [ [ 0 for i in range(3) ] for j in range(4) ]
table1b[0] = ['clm_bt_'+subsrid, 'Temperatura nube', ' &deg;C', '9999']
table1b[1] = ['clm_cp_'+subsrid, 'Altezza nube', ' km', '9999']
table1b[2] = ['clm_type_'+subsrid, 'Tipo di nube', ' ', '9999']
table1b[3] = ['clm_phase_'+subsrid, 'Fase della nube', ' ', '9999']

#Tabella per la precipitazione cumulata da rete a terra:
table4 = [ [ 0 for i in range(4) ] for j in range(5) ]
table4[0] = ['PLUV_ultima_ora'+subsrid2, 'Pioggia ult. ora', 'mm', '60']
table4[1] = ['PLUV_ultime_3ore'+subsrid2, 'Pioggia ult. 3ore', 'mm', '180']
table4[2] = ['PLUV_ultime_6ore'+subsrid2, 'Pioggia ult. 6ore', 'mm', '360']
table4[3] = ['PLUV_ultime_12ore'+subsrid2, 'Pioggia ult. 12ore', 'mm', '720']
table4[4] = ['PLUV_ultime_24ore'+subsrid2, 'Pioggia ult. 24ore', 'mm', '1440']

#Tabella per la neve fresca / neve al suolo:
table3 = [ [ 0 for i in range(3) ] for j in range(3) ]
table3[0] = ['piemonte_kriging_Hn'+subsrid3, 'Neve fresca', 'cm', '9999']
table3[1] = ['piemonte_kriging_Hn_3gg'+subsrid3, 'Neve fresca 3gg', 'cm', '9999']
table3[2] = ['piemonte_kriging_Hs'+subsrid3, 'Neve al suolo', 'cm', '9999']

#Tabella per la precipitazione prevista a 72h, modello FEWS:
table5 = [ [ 0 for i in range(1) ] for j in range(1) ]
table5[0] = ['fews_73h_mm_'+subsrid4, 'Pioggia prevista 72h', 'mm', '9999']


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
def tipo_precipitazione(infile_path):
  #print "<div id='tabs-1'>"
  for row in table0:
      inside_rows(row, infile_path)

      if valIDRO==None:
	#print "<h1>Tipo di precipitazione:</h1> n.d. "
	print "<script>console.log('%s');</script>" % (dataIDRO)
        continue

      tdataIDRO = datetime.strptime(dataIDRO,fmt)
      deltat = (datetime.now() - tdataIDRO).seconds / 60.

      if deltat > 20:
        print "<h1>Tipo di precipitazione: <b>n.d. (rit = %i min)</b></h1>" % (deltat)
        continue

      if (valIDRO[1] != 'nan'):
        n = int(valIDRO[1])
        #Decodifico il valore in stringa:
        if n == 0:
            print "<h1>Tipo di precipitazione: <b>nessuna</b></h1>"
        elif n == 1:
            print "<h1>Tipo di precipitazione: <b>pioggia debole</b></h1>"
        elif n == 2:
            print "<h1>Tipo di precipitazione: <b>pioggia moderata</b></h1>"
        elif n == 3:
            print "<h1>Tipo di precipitazione: <b>pioggia forte</b></h1>"
        elif n == 4:
            print "<h1>Tipo di precipitazione: <b>pioggia molto forte</b></h1>"
        elif n == 5:
            print "<h1>Tipo di precipitazione: <b>neve debole</b></h1>"
        elif n == 6:
            print "<h1>Tipo di precipitazione: <b>neve moderata</b></h1>"
        elif n == 7:
            print "<h1>Tipo di precipitazione: <b>neve forte</b></h1>"
        elif n == 8:
            print "<h1>Tipo di precipitazione: <b>neve mista pioggia debole</b></h1>"
        elif n == 9:
            print "<h1>Tipo di precipitazione: <b>neve mista pioggia moderata</b></h1>"
        elif n == 10:
            print "<h1>Tipo di precipitazione: <b>neve mista pioggia forte</b></h1>"
        elif n == 11:
            print "<h1>Tipo di precipitazione: <b>grandine mista pioggia</b></h1>"
        elif n == 12:
            print "<h1>Tipo di precipitazione: <b>grandine</b></h1>"
        elif n > 12:
            print "<h1>Tipo di precipitazione: <b>n.d.</b></h1>"
        else:
            print "<h1>Tipo di precipitazione: <b>nessuna</b></h1>"
      else:
        print "<h1>Tipo di precipitazione: <b>n.d.</b></h1>"


#Elaboro la precipitazione istantanea:
def precipitazione(infile_path, stop_raster):
  print "<h1>\nPrecipitazione istantanea stimata da radar (mm/h):<table>"
  for row in table1:
        check_raster=0
        for raster in stop_raster:
          if (raster in row[0]):
            check_raster=1
        if check_raster==1:
          continue

        inside_rows(row, infile_path)

        if valIDRO==None:
            #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
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
	print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, val, dataIDRO)
	#fname2 = os.path.basename(fname)
  print "</table></h1>"

#Elaboro la precipitazione cumulata:
  #if (webgis == 'expo2015' or webgis == 'expo2015_pub' or webgis == 'arpalombardia'):
  #  print "</div>"
  #  return
  if active_queries==1 or active_queries==2 or active_queries==4:
      prec_cumulata(infile_path)
  if active_queries in[1,3,8]:
      rhi_bandax()
  #print "</div>"


#Elaboro la precipitazione cumulata:
#  if (webgis == 'expo2015' or webgis == 'expo2015_pub' or webgis == 'arpalombardia'):
#    print "</div>"
#    return

def prec_cumulata(infile_path):
  print "<h1>\nPrecipitazione cumulata stimata mosaico piemontese:<table>"
  radar_prec=[]
  for row in table2:
        inside_rows(row, infile_path)

        if valIDRO==None:
	    #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 30:
           colorname = 'black'
        elif deltat < 45:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),1), dataIDRO)
        #fname2 = os.path.basename(fname)

        #Creo una variabile da poter passare allo script php che costruisce i grafici sui tempi di ritorno confrontandoli con la precipitazione stimata da radar:
        prec = "%s,%s" % (durata_pioggia, round(float(valIDRO[1]),1))
        radar_prec.append(prec)

  global radar_arr
  radar_arr = '@@'.join(radar_prec)
  #60,8.2@@180,11.4@@360,11.4@@999,11.9
  #print radar_arr

  print "</table></h1>"

def rhi_bandax():
  #if webgis == 'centrofunzionale':
    print '</h2><a href="%s/common/DATA/xband/xband_vc.png" target="_self">X-band: max echo</a>' % (root_dir_html)
    print '<a href="%s/common/DATA/xband/rhi_1.png" target="_self">X-band: RHI nord-sud</a>' % (root_dir_html)
    print '<a href="%s/common/DATA/xband/rhi_2.png" target="_self">X-band: RHI ovest</a>' % (root_dir_html)


def precipitazione_prevista(infile_path, stop_raster):
  print "<h1>\nPrecipitazione prevista prossime 72h (mm):<table>"
  for row in table5:
        check_raster=0
        for raster in stop_raster:
          if (raster in row[0]):
            check_raster=1
        if check_raster==1:
          continue

        inside_rows(row, infile_path)

        if valIDRO==None:
	    #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
            continue

        val=round(float(valIDRO[1]),1)

        tdataIDRO = datetime.strptime(dataIDRO, fmt)
	#deltat = (datetime.now() - tdataIDRO).seconds / 60.
	#questa differenca pero' prende solo i secondi: ma se ci sono giorni di differenza??
	# Convert to Unix timestamp
	tdataIDRO_ts = time.mktime(tdataIDRO.timetuple())
	tnow_ts = time.mktime( (datetime.now()).timetuple())
        deltat = int( tnow_ts-tdataIDRO_ts ) / 60.
        if deltat < 720: #12 ore
           colorname = 'black'
        elif deltat < 1440: #24 ore
           colorname = 'darkorange'
        else:
           colorname = 'red'
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, val, dataIDRO)
        #fname2 = os.path.basename(fname)
  print "</table></h1>"


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
	    #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
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
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s%s &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, val, unita, dataIDRO)


        #fname2 = os.path.basename(fname)
  print "</table></h1>"


  print "</div>"


#### DATI RASTER IDRO ####
def raster_idro(infile_path):
  print "<div id='tabs-2'>"

  #if srid == '900913':
  #      subsrid = "3785.tiff"
  #elif srid == '32632':
  #      subsrid = "32632.tiff"

  #infile_path = "/var/www/html/common/DATA/idro/PLUV/"

  rete_prec=[]

  print "<h1>\nPrecipitazione cumulata da rete a terra (mm):<table>"
  for row in table4:
        inside_rows(row, infile_path)

        if valIDRO==None:
	    #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 60:
           colorname = 'black'
        elif deltat < 75:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %s &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),1), dataIDRO)
        #fname2 = os.path.basename(fname)

        #Creo una variabile da poter passare allo script php che costruisce i grafici sui tempi di ritorno confrontandoli con la precipitazione rilevate da rete a terra:
        prec = "%s,%s" % (durata_pioggia, round(float(valIDRO[1]),1))
        rete_prec.append(prec)

  global rete_arr
  rete_arr = '@@'.join(rete_prec)
  #60,8.2@@180,11.4@@360,11.4@@999,11.9
  #print rete_arr

  print "</table></h1>"
  print '</div>'


### DATI NEVE ###
def neve(infile_path):
  print "<div id='tabs-3'>"

  #if srid == '900913':
  #      subsrid = "3875.tiff"
  #elif srid == '32632':
  #      subsrid = "32632.tiff"

  #infile_path = "/var/www/html/common/DATA/nivo/"

  print "<h1>\nAltezze neve (cm):<table>"
  for row in table3:
        inside_rows(row, infile_path)
        if valIDRO==None:
	    #print "<tr><td> n.d. </td></tr>"
	    print "<script>console.log('%s');</script>" % (dataIDRO)
            continue

        tdataIDRO = datetime.strptime(dataIDRO,fmt)
        deltat = (datetime.now() - tdataIDRO).seconds / 60.
        if deltat < 1440:
           colorname = 'black'
        elif deltat < 2160:
           colorname = 'darkorange'
        else:
           colorname = 'red'
        print "<tr style='color:%s;'><td>%s</td> <td> &nbsp %d &nbsp </td> <td>%s UTC</td> </tr>" % (colorname, fname_pub, round(float(valIDRO[1]),0), dataIDRO)
        #fname2 = os.path.basename(fname)
  print "</table></h1>"
  print '</div>'


### ATLANTE PIOGGE - GRAPH ###
def atlante():
  print "<div id='tabs-5'>"

  #print "<iframe id='myIFrame' width='100%' height='98%' src='/cgi-bin/query_raster_devel.py?x=%s&y=%s&srid=%s&webgis=%s&radar_prec=%s' frameborder='0' allowtransparency='true' seamless='seamless'></iframe>" % (x, y, srid, webgis, radar_arr)
  print "<iframe id='myIFrame' width='100%' height='64%' src="
  #print "<iframe id='myIFrame' width='100%' height=450px src="
  print "'%s/common/scripts/plot_atl_piogge.php?x=%s&y=%s&srid=%s&webgis=%s&radar_prec=%s&rete_prec=%s&root_dir_html=%s'" % (root_dir_html, x, y, srid, webgis, radar_arr, rete_arr, root_dir_html)
  print " frameborder='0' allowtransparency='true' seamless='seamless'></iframe>"

  print '</div>'


### RASTER MAPSERVER ###
def query_raster_MS(mapfile_path, rasters):
  #import mapscript #dopo aggiornamento python se carico mapscript dopo le gdal via web ritorna un errore
  mapfile2 = mapfile_path
  m2 = mapscript.mapObj(mapfile2)
  p2 = mapscript.pointObj(x, y)
  #raster = rasters[0]
  for raster in rasters:
    layer2 = m2.getLayerByName(raster)
    print layer2.name
    layer2.queryByPoint( m2, p2, mapscript.MS_MULTIPLE, 500.0) ##tolleranza in unita mappa. Se <=0 si usa la tolleranza (in pixel) definita nel file MAP
    results2 = layer2.getResults()
    if results2:
      for i in range(results2.numresults):
        result2 = results2.getResult(i)
    layer2.open()
    s2 = layer2.getShape( result2 )
    if results2:
      for i in range(results2.numresults):
        result2 = results2.getResult(i)
        s2 = layer2.getShape( result2 )
        for j in range(layer2.numitems):
          print '%s: %s<br/>' % (layer2.getItem(j), s2.getValue(j))

    layer2.close()



#A questo punto creo i vari TAB a seconda del tipo di webgis:
print "<div id='tabs'>"
stop_raster = []
#se vuoi calcolare l'atlante, devi per forza anche calcolare la cumulata...
if active_queries==1: #funzionalita complete
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li><li><a href='#tabs-3'>Neve-rete a terra</a></li><li><a href='#tabs-5'>Atlante piogge</a></li></ul>"
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
    neve("/var/www/html/common/DATA/nivo/")
    atlante()
elif active_queries==2: #funzionalita complete tranne RHI bandax
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li><li><a href='#tabs-3'>Neve-rete a terra</a></li><li><a href='#tabs-5'>Atlante piogge</a></li></ul>"
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
    neve("/var/www/html/common/DATA/nivo/")
    atlante()
elif active_queries==3: #tolgo tutto cio che riguarda il Piemonte (per expo e lombardia)
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    stop_raster = ["_composite_", "p_ist_"+subsrid]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
elif active_queries==4: #tolgo banda X (per pubblico)
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li><li><a href='#tabs-3'>Neve-rete a terra</a></li><li><a href='#tabs-5'>Atlante piogge</a></li></ul>"
    stop_raster = ["xband_", "_composite_", "_ist_bis"]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
    neve("/var/www/html/common/DATA/nivo/")
    atlante()
elif active_queries==5: #interrogo solo i raster DPC, mosaico NW-NordItalia e Meteosat
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    stop_raster = ["xband_", "_ist_bis", "p_ist_"+subsrid]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
elif active_queries==6: #funzionalita complete tranne Atlante Piogge
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li><li><a href='#tabs-3'>Neve-rete a terra</a></li></ul>"
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
    neve("/var/www/html/common/DATA/nivo/")
elif active_queries==7: #interrogo solo i raster DPC, mosaico LEMA e Meteosat
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    stop_raster = ["xband_", "_composite_", "p_ist_"+subsrid]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
elif active_queries==8: #Interrogo solo Meteosat, radar Piemonte e BandaX
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    stop_raster = ["_composite_", "_ist_bis", "_dpc_ist"]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
elif active_queries==9: #interrogo solo i raster DPC, mosaico LEMA, Meteosat e i raster di pioggia da rete a terra
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li><li><a href='#tabs-4'>Meteosat</a></li><li><a href='#tabs-2'>Pioggia-rete a terra</a></li></ul>"
    stop_raster = ["xband_", "_composite_", "p_ist_"+subsrid]
    print "<div id='tabs-1'>"
    tipo_precipitazione("/var/www/html/common/DATA/raster/")
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    print "</div>"
    meteosat("/var/www/html/common/DATA/raster/")
    raster_idro("/var/www/html/common/DATA/idro/PLUV/")
elif active_queries==10: #Interrogo solo Meteosat
    print "<ul><li><a href='#tabs-4'>Meteosat</a></li></ul>"
    #stop_raster = ["_composite_", "_ist_bis", "_dpc_ist"]
    #precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    meteosat("/var/www/html/common/DATA/raster/")
elif active_queries==11: #Interrogo solo dati di neve
    print "<ul><li><a href='#tabs-3'>Neve-rete a terra</a></li></ul>"
    neve("/var/www/html/common/DATA/nivo/")
elif active_queries==12: #interrogo raster DPC e previsioni FEWS a 72h senza Tipo di precipitazione - DA SVILUPPARE
    print "<ul><li><a href='#tabs-1'>Pioggia-radar</a></li></ul>"
    stop_raster = ["xband_", "_ist_bis", "_composite_", "p_ist_"+subsrid]
    print "<div id='tabs-1'>"
    precipitazione("/var/www/html/common/DATA/raster/", stop_raster)
    precipitazione_prevista("/var/www/html/common/DATA/fews/anime_png/", stop_raster)
    print "</div>"
elif active_queries==13: #interrogo raster tramite MapServer - DA SVILUPPARE
    print "<ul><li><a href='#tabs-1'>Raster MS</a></li></ul>"
    list_raster = ["limiti_comuni_italiani_MS1", "reticolo_idro_lm_MS1"]
    #in questo caso DOVRESTI RIUSCIRE A RECUPERARE I LAYER VISIBILI FORNITI DA MS in modo da rendere questa parte ancora piu flessibile!!!!
    print "<div id='tabs-1'>"
    query_raster_MS("/var/www/IRIS_BASE/html/common/mapfiles/map900913.map", list_raster)
    print "</div>"



print '</div>'
#chiusura del div principale per la creazione dei TAB jQuery

print '</body>'
print '</html>'

