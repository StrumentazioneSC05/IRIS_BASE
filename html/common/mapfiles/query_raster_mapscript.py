#!/usr/bin/python

'''
Script di provare per usare le librerie MAPSERVER su Python per interrogare raster da file map.
E' una prova per capire se puo' essere una valida e piu' rapida alternativa al metodo gdallocationinfo 
che uso normalmente nell'interrogare i raster su webgis
Il comando che userei io con gdal sarebbe:
gdallocationinfo -l_srs epsg:900913 /var/www/html/common/DATA/raster/googlemap_ist_900913.tiff 928751 5781309
FUNZIONA??
'''

print 'CIAO'
import mapscript
mapfile = 'not_used/raster.map'
m = mapscript.mapObj(mapfile)

p = mapscript.pointObj(510321, 4866413)
layer = m.getLayer(1)

print layer.name

layer.queryByPoint( m, p, mapscript.MS_MULTIPLE, 180.0 ) #tanti risultati, senno MS_SINGLE. 180 e' la tolleranza
results = layer.getResults()

if results:
   for i in range(results.numresults):
     result = results.getResult(i)
     layer.open()
     s = layer.getShape( result )
     for j in range(layer.numitems):
       print '%s: %s' % (layer.getItem(j), s.getValue(j))
     layer.close()
else:
  print 'NO result'

print 'qualche risultato??'
