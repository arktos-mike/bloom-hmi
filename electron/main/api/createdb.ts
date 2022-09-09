const createTableText = `
CREATE TABLE IF NOT EXISTS hwconfig (
  name text PRIMARY KEY NOT NULL,
  data JSONB
);
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  tag JSONB PRIMARY KEY NOT NULL,
  val NUMERIC,
  updated TIMESTAMPTZ not null default current_timestamp
);
CREATE INDEX IF NOT EXISTS idxgingroup ON tags USING gin ((tag -> 'group'));
CREATE INDEX IF NOT EXISTS idxginname ON tags USING gin ((tag -> 'name'));
CREATE INDEX IF NOT EXISTS idxgindev ON tags USING gin ((tag -> 'dev'));
CREATE INDEX IF NOT EXISTS idxgintype ON tags USING gin ((tag -> 'type'));
CREATE INDEX IF NOT EXISTS idxginreg ON tags USING gin ((tag -> 'reg'));
DROP TABLE IF EXISTS locales;
CREATE TABLE locales (
  locale text PRIMARY KEY NOT NULL,
  translation JSONB,
  selected BOOLEAN NOT NULL
);
CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name text not null,
    email text,
    phonenumber text,
    password varchar not null,
    role text
  );
CREATE TABLE IF NOT EXISTS modelog (
    timestamp tstzrange PRIMARY KEY not null default tstzrange(current_timestamp,NULL,'[)'),
    modecode NUMERIC,
    picks NUMERIC
  );
CREATE INDEX IF NOT EXISTS modelog_tstzrange_idx ON modelog USING GIST (timestamp);
CREATE INDEX IF NOT EXISTS modelog_modecode ON modelog (modecode);
CREATE TABLE IF NOT EXISTS shiftconfig (
    shiftname text PRIMARY KEY not null,
    starttime TIMETZ(0),
    duration interval,
    monday BOOLEAN,
    tuesday BOOLEAN,
    wednesday BOOLEAN,
    thursday BOOLEAN,
    friday BOOLEAN,
    saturday BOOLEAN,
    sunday BOOLEAN
  );
create or replace
  function shiftdetect(stamp timestamp with time zone,
  out shiftname text,
  out shiftstart timestamp with time zone,
  out shiftend timestamp with time zone,
  out shiftdur interval)
   returns record
   language plpgsql
  as $function$
  declare
  dow numeric;

  weekday text;

  tz int;

  begin
  tz :=(extract(timezone_hour
  from
  stamp)::int);

  stamp :=(stamp at time zone 'utc' at time zone 'utc');

  dow := (
  select
    extract(ISODOW
  from
    stamp));

  weekday := (case
    when dow = 1 then 'monday'
    when dow = 2 then 'tuesday'
    when dow = 3 then 'wednesday'
    when dow = 4 then 'thursday'
    when dow = 5 then 'friday'
    when dow = 6 then 'saturday'
    when dow = 7 then 'sunday'
  end);

  execute 'select shiftname, make_timestamptz(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) as shiftstart, make_timestamptz(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration as shiftend from shiftconfig where ((' || weekday || ') and $1 >= make_timestamptz(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) and $1 < make_timestamptz(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration)'
  into
    shiftname,
    shiftstart,
    shiftend
      using stamp,
    'UTC';

  if (shiftname = '') is not false then

       execute 'select shiftname, make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) as shiftstart, make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration as shiftend from shiftconfig where ((' || weekday || ') and ((extract(hour from starttime at time zone $2)::int + $4)/ 24 ) > 0 and $1 >= make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) and $1 < make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration)'
  into
    shiftname,
    shiftstart,
    shiftend
      using stamp,
    'UTC',
    stamp - interval '1D',
    tz
               ;

  if (shiftname = '') is not false then

       weekday := (case
    when dow = 1 then 'sunday'
    when dow = 2 then 'monday'
    when dow = 3 then 'tuesday'
    when dow = 4 then 'wednesday'
    when dow = 5 then 'thursday'
    when dow = 6 then 'friday'
    when dow = 7 then 'saturday'
  end);

  execute 'select shiftname, make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) as shiftstart, make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration as shiftend from shiftconfig where ((' || weekday || ') and ((extract(hour from starttime at time zone $2)::int + $4)/ 24 ) = 0 and $1 >= make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2) and $1 < make_timestamptz(extract(year from $3)::int,extract(month from $3)::int,extract(day from $3)::int,extract(hour from starttime at time zone $2)::int,extract(minute from starttime at time zone $2)::int,0.0,$2)+duration)'
  into
    shiftname,
    shiftstart,
    shiftend
      using stamp,
    'UTC',
    stamp - interval '1D',
    tz
               ;
  end if;
  end if;

  shiftdur := shiftend - shiftstart;
  end;

  $function$
  ;
DROP TRIGGER IF EXISTS modeChanged
  ON tags;
DROP FUNCTION IF EXISTS modelog;
create function modelog()
   returns trigger
   language plpgsql
  as $function$
  begin
  insert
    into
    modelog
  values(tstzrange(current_timestamp(6),NULL,'[)'),
  new.val,
  NULL);
  return null;
  end;

  $function$
  ;
create trigger modeChanged after insert or update on tags for row when (new.tag->>'name'='modeCode') execute function modelog();
DROP TRIGGER IF EXISTS modeupdate
  ON modelog;
DROP FUNCTION IF EXISTS modeupdate;
create function modeupdate()
   returns trigger
   language plpgsql
  as $function$
  begin
  UPDATE modelog SET
  timestamp = tstzrange(
      lower(timestamp),
      current_timestamp(6),
      '[)'
  ), picks = (case when (modecode = 1) then (select val from tags where (tag->>'name' = 'picksLastRun'))
  else NULL end)
  WHERE upper_inf(timestamp);
  return new;
  end;

  $function$
  ;
create trigger modeupdate before insert on modelog for row execute function modeupdate();
create or replace function getstatinfo(starttime timestamp with time zone,
endtime timestamp with time zone,
out sumpicks numeric,
out efficiency numeric)
 returns record
 language plpgsql
as $function$

begin
	sumpicks := (
select
	sum(
case when not (timestamp &> tstzrange(starttime, endtime, '[)'))
then ceil(((select extract(epoch from (upper(tstzrange(starttime, endtime, '[)')* timestamp)-lower(tstzrange(starttime, endtime, '[)')* timestamp))))/(select extract(epoch from (upper(timestamp)-lower(timestamp)))))* picks)
when (timestamp @> tstzrange(starttime, endtime, '[)'))
then round(((select extract(epoch from (upper(tstzrange(starttime, endtime, '[)')* timestamp)-lower(tstzrange(starttime, endtime, '[)')* timestamp))))/(select extract(epoch from (upper(timestamp)-lower(timestamp)))))* picks)
when not (timestamp &< tstzrange(starttime, endtime, '[)'))
then floor(((select extract(epoch from (upper(tstzrange(starttime, endtime, '[)')* timestamp)-lower(tstzrange(starttime, endtime, '[)')* timestamp))))/(select extract(epoch from (upper(timestamp)-lower(timestamp)))))* picks)
else picks
end
)
from
	modelog
where
	tstzrange(starttime,
	endtime,
	'[)') && timestamp
	and modecode = 1 );

efficiency := ((sumpicks * 6000)/ ( (
select
	val
from
	tags
where
	(tag->>'name' = 'planSpeedMainDrive')) * (
select
	extract(epoch
from
	(upper(tstzrange(starttime, endtime, '[)'))-lower(tstzrange(starttime, endtime, '[)'))))) ) );
end;

$function$
;
`
export default createTableText
