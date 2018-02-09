SELECT denominazione, quota_int, codice1, codice2, codice3 FROM  dati_di_base.rete_meteoidrografica a LEFT OUTER JOIN dati_di_base.soglie_idrometriche b ON a.codice_istat_comune = b.codice_istat_comune AND a.progr_punto_com = b.progr_punto_com and id_parametro = 'IDRO' WHERE a.denominazione like '%TRANA%';

