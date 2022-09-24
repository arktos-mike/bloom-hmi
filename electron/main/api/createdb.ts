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
    modecode NUMERIC not null,
    picks NUMERIC,
    planspeed NUMERIC default NULL,
    plandensity NUMERIC default NULL
  );
CREATE INDEX IF NOT EXISTS modelog_tstzrange_idx ON modelog USING GIST (timestamp);
CREATE INDEX IF NOT EXISTS modelog_modecode ON modelog (modecode);
CREATE TABLE IF NOT EXISTS userlog (
  timestamp tstzrange PRIMARY KEY not null default tstzrange(current_timestamp,NULL,'[)'),
  id NUMERIC,
  name text not null,
  role text,
  loginby text,
  logoutby text
);
CREATE INDEX IF NOT EXISTS userlog_tstzrange_idx ON userlog USING GIST (timestamp);
CREATE TABLE IF NOT EXISTS lifetime (
  type text,
  serialno text PRIMARY KEY,
  mfgdate date,
  picks NUMERIC,
  cloth NUMERIC,
  motor interval
);
DROP RULE IF EXISTS lifetime_del_protect ON lifetime;
CREATE RULE lifetime_del_protect AS ON DELETE TO lifetime DO INSTEAD NOTHING;
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
CREATE OR REPLACE FUNCTION modelog()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  begin
  IF new.val is not null then
  insert
    into
    modelog
  values(tstzrange(current_timestamp(6),NULL,'[)'),
  new.val,
  null,(select
	val
from
	tags
where
	(tag->>'name' = 'planSpeedMainDrive')),
	(select
	val
from
	tags
where
	(tag->>'name' = 'planClothDensity'))
 );
 end if;
  return null;
  end;

  $function$
;
create trigger modeChanged after insert or update on tags for row when (new.tag->>'name'='modeCode') execute function modelog();
DROP TRIGGER IF EXISTS modeupdate
  ON modelog;
DROP FUNCTION IF EXISTS modeupdate;
create or replace function modeupdate()
 returns trigger
 language plpgsql
as $function$
declare
  picksLastRun numeric;

density numeric;

code numeric;

clock interval;

warpLength numeric;

warpShrinkage numeric;

begin
	 picksLastRun :=(
select
	val
from
	tags
where
	(tag->>'name' = 'picksLastRun'));

update
	modelog
set
	timestamp = tstzrange(
      lower(timestamp),
	current_timestamp(6),
	'[)'
  ),
	picks = (case
		when (modecode = 1) then (picksLastRun)
		else null
	end)
where
	upper_inf(timestamp) returning modecode, (current_timestamp(6)-lower(timestamp)) into code, clock;

if code = 1 then
   density :=(
select
	val
from
	tags
where
	(tag->>'name' = 'planClothDensity'));

warpShrinkage :=(
  select
    val
  from
    tags
  where
    (tag->>'name' = 'warpShrinkage'));

UPDATE
  tags
SET
  val = val - (picksLastRun / (100 * density * (1 - 0.01 * warpShrinkage))),
  updated = current_timestamp
where
  tag->>'name'= 'warpBeamLength';

update
	lifetime
set
	picks = picks + picksLastRun,
	cloth = cloth + (picksLastRun / (100 * density)),
	motor = motor + clock
where
	serialno is not null;
end if;

return new;
end;

$function$
;
create trigger modeupdate before insert on modelog for row execute function modeupdate();
create or replace
function getstatinfo(starttime timestamp with time zone,
endtime timestamp with time zone,
out sumpicks numeric,
out efficiency numeric,
out runtime interval,
out rpm numeric,
out meters numeric,
out mps numeric,
out stops jsonb)
 returns record
 language plpgsql
as $function$

begin
select
	sum(
case when not (timestamp &> tstzrange(starttime, endtime, '[)'))
then ceil(ppicks)
when (timestamp @> tstzrange(starttime, endtime, '[)'))
then round(ppicks)
when not (timestamp &< tstzrange(starttime, endtime, '[)'))
then
case when upper_inf(timestamp) then
cpicks
else
floor(ppicks)
end
else picks
end
),
	sum(dur),
	sum(case when upper_inf(timestamp) then
cpicks * 6000 /(planspeed * (durqs-exdurs))
else
ppicks * 6000 /(planspeed * (durqs-exdurs))
end ),
	sum(case when upper_inf(timestamp) then
cpicks /(100 * plandensity)
else
ppicks /(100 * plandensity)
end )
into
	sumpicks,
	runtime,
	efficiency,
	meters
from
	modelog,
	lateral (
	select
		extract(epoch
	from
		(upper(timestamp)-lower(timestamp))) as durrs) rowsecduration,
	lateral (
	select
		upper(timestamp * tstzrange(starttime, endtime, '[)'))-lower(timestamp * tstzrange(starttime, endtime, '[)')) as dur) intduration,
	lateral (
	select
		extract(epoch
	from
		dur) as durs) intsecduration,
	lateral (
	select
		(durs / durrs) * picks as ppicks) partialpicks,
	lateral (
	select
		extract(epoch
	from
		(upper(tstzrange(starttime, endtime, '[)'))-lower(tstzrange(starttime, endtime, '[)')))) as durqs) querysecduration,
	lateral(
	select
		sum((select upper(timestamp * tstzrange(starttime, endtime, '[)'))-lower(timestamp * tstzrange(starttime, endtime, '[)')))) as exdur
	from
		modelog
	where
		tstzrange(starttime,
		endtime,
		'[)') && timestamp
		and
    (modecode = 2
			or modecode = 0)) normstop,
	lateral (
	select
		extract(epoch
	from
		exdur) as exdurs) normstopsecduration,
	lateral (
	select
		val as cpicks
	from
		tags
	where
		(tag->>'name' = 'picksLastRun') ) currentpicks
where
	tstzrange(starttime,
	endtime,
	'[)') && timestamp
	and modecode = 1 ;

rpm := (round((sumpicks * 60)/(
select
	extract(epoch
from
	runtime) )));

mps := (round(meters /(
select
	extract(epoch
from
	runtime) )));

stops := (
with t(num,
stop) as (
select
	*
from
	(
values (0,
'other'),
(2,
'button'),
(3,
'warp'),
(4,
'weft'),
(5,
'tool'),
(6,
'fabric') ) as t(num,
	stop) )
select
	jsonb_agg(json_build_object(t.stop, json_build_object('total', total , 'dur', dur)))
from
	t,
	lateral(
	select
		count(*) as total,
		sum((select upper(timestamp * tstzrange(starttime, endtime, '[)'))-lower(timestamp * tstzrange(starttime, endtime, '[)')))) as dur
	from
		modelog
	where
		tstzrange(starttime,
		endtime,
		'[)') && timestamp
			and modecode = t.num) stat );
end;

$function$
;
`
export default createTableText
