#!/usr/bin/python

"""
script che interroga i vari raster png per recuperarne data di creazione con ImageMagick o GdalInfo
"""

import os,sys
import cgi
#import cgitb; cgitb.enable()
import commands
#from datetime import datetime

print "Content-type:text/plain\r\n"

# Lettura dei parametri
fs = cgi.FieldStorage()

try:
    filename = str(fs["filename"].value)
except:
    exit()

url_filename = "/var/www/html/" + filename

#Metodo usando ImageMagick - lo uso per Xban perche' Renzo mi passa l'immagine cosi'
if (filename=='xband.png'):
  string = "/usr/bin/identify -verbose %s | grep RADAR" % (url_filename)
  date_png = commands.getstatusoutput(string)
  #Esempio: RADAR: 2016-06-30h12:05
  only_date = date_png[1].split()
  print only_date[1][:16]

else:
  #Usando Gdalinfo - pare piu veloce e la parola chiave del metadato dovrebbe essere uguale per tutti i dati:
  string = "/usr/bin/gdalinfo -nogcp -nofl -noct %s | grep DATETIME" % (url_filename)
  date_png = commands.getstatusoutput(string)
  #Esempio: DATETIME=2016-06-30 12:05
  only_date = date_png[1].split('=')
  print only_date[1].replace(" ","h")[:16]

