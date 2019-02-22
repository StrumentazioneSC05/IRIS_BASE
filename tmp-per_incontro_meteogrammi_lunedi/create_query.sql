/*

codice per creare le viste utili alla rappresentazione dei dati aggregati nei meteogrammi

*/

-- View: expo2015.v_anagraficasensori_lm

-- DROP VIEW expo2015.v_anagraficasensori_lm;

CREATE OR REPLACE VIEW expo2015.v_anagraficasensori_lm AS 
 SELECT ((('<a target=_blank href=http://meteo.arpalombardia.it/mappe/Meteogrammi.php?idStazione='::text || a.idstazione) || '&modalita=day > '::text) || a.idstazione) || ' </a>'::text AS meteogramma24h,
    a.idrete AS rete,
    a.denominazione,
    a.idstazione,
    a.quota,
    a.provincia,
    a.altezza,
    a.frequenza,
    a.the_geom::geometry(Point,32632) AS the_geom,
    a.idstazione AS gid,
    a.nometipologia_dst AS tipo_staz,
        CASE
            WHEN a.nometipologia_dst ~~ '%I%'::text THEN 'Idrometrica'::text
            WHEN a.nometipologia_dst ~~ '%N%'::text THEN 'Nivometrica'::text
            WHEN a.nometipologia_dst = 'P'::text THEN 'Pluviometrica'::text
            WHEN a.nometipologia_dst = 'V'::text THEN 'Anemometrica'::text
            ELSE 'Meteorologica'::text
        END AS meteo_tab,
    a.nometipologia AS nometipologie,
    a.idsensore AS idsensori,
    a.utm_nord,
    a.utm_est
   FROM ( SELECT anagraficasensori_lm.idstazione,
            max(anagraficasensori_lm.idrete) AS idrete,
            max(anagraficasensori_lm.provincia) AS provincia,
            max(anagraficasensori_lm.frequenza) AS frequenza,
            max(anagraficasensori_lm.altezza) AS altezza,
            array_to_string(array_agg(DISTINCT
                CASE
                    WHEN anagraficasensori_lm.nometipologia::text = 'VV'::text THEN 'V'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'PP'::text THEN 'P'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'DV'::text THEN ''::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'UR'::text THEN 'H'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'DVS'::text THEN ''::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'VVS'::text THEN 'V'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'PA'::text THEN 'B'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text = 'RG'::text THEN 'R'::character varying
                    WHEN anagraficasensori_lm.nometipologia::text ~~ 'TP%'::text THEN 'W'::character varying
                    ELSE anagraficasensori_lm.nometipologia
                END), ''::text) AS nometipologia_dst,
            array_agg(anagraficasensori_lm.nometipologia) AS nometipologia,
            array_agg(anagraficasensori_lm.idsensore) AS idsensore,
            max(anagraficasensori_lm.the_geom::text) AS the_geom,
            (max(anagraficasensori_lm.comune::text) || ' '::text) || COALESCE(max(anagraficasensori_lm.attributo::text), ''::text) AS denominazione,
            max(anagraficasensori_lm.quota) AS quota,
            max(anagraficasensori_lm.utm_nord) AS utm_nord,
            max(anagraficasensori_lm.utm_est) AS utm_est
           FROM expo2015.anagraficasensori_lm
          WHERE anagraficasensori_lm.storico::text = 'No'::text
          GROUP BY anagraficasensori_lm.idstazione) a;

ALTER TABLE expo2015.v_anagraficasensori_lm
  OWNER TO postgres;
GRANT ALL ON TABLE expo2015.v_anagraficasensori_lm TO postgres;
GRANT SELECT ON TABLE expo2015.v_anagraficasensori_lm TO webgis_r;
COMMENT ON VIEW expo2015.v_anagraficasensori_lm
  IS 'TEST IRIS Lombardia - anagrafica sensori rete meteo ARPA Lombardia per visualizzazione su WebGis';


-- View: expo2015.v_meteo_real_time_lm

-- DROP VIEW expo2015.v_meteo_real_time_lm;

CREATE OR REPLACE VIEW expo2015.v_meteo_real_time_lm AS 
 SELECT b.idstazione AS id_stazione,
    to_timestamp(a.data_e_ora::text, 'YYYYMMDDHH24MI'::text)::timestamp without time zone AS data_e_ora,
    a.id_sensore,
    b.nometipologia AS id_parametro,
    a.misura AS valore_originale,
        CASE
            WHEN a.tipologia_validaz::text = 'VA'::text THEN 'OK'::text
            ELSE 'V'::text
        END::character varying(3) AS tipologia_validaz,
    '??'::text AS flag_validaz_autom,
    '??'::text AS flag_gestore_sistema,
    a.data_agg,
    b.frequenza,
    b.altezza
   FROM expo2015.meteo_real_time_lm a
     LEFT JOIN expo2015.anagraficasensori_lm b ON a.id_sensore = b.idsensore;

ALTER TABLE expo2015.v_meteo_real_time_lm
  OWNER TO postgres;
GRANT ALL ON TABLE expo2015.v_meteo_real_time_lm TO postgres;
GRANT SELECT ON TABLE expo2015.v_meteo_real_time_lm TO webgis_r;
COMMENT ON VIEW expo2015.v_meteo_real_time_lm
  IS 'TEST IRIS Lombardia per costruzione grafici';

