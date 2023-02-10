const createTableText = `
CREATE TABLE IF NOT EXISTS hwconfig (
  name text PRIMARY KEY NOT NULL,
  data JSONB
);
CREATE TABLE IF NOT EXISTS tags (
  tag JSONB PRIMARY KEY NOT NULL,
  val NUMERIC,
  updated TIMESTAMPTZ not null default current_timestamp,
  link BOOLEAN
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
  picks NUMERIC not null default 0,
  cloth NUMERIC not null default 0,
  motor interval not null default interval '0' second
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
CREATE TABLE IF NOT EXISTS clothlog (
    timestamp tstzrange PRIMARY KEY not null default tstzrange(current_timestamp,NULL,'[)'),
    event NUMERIC,
    meters numeric
  );
CREATE INDEX IF NOT EXISTS clothlog_tstzrange_idx ON clothlog USING GIST (timestamp);
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
  values(tstzrange(current_timestamp(3),NULL,'[)'),
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
	current_timestamp(3),
	'[)'
  ),
	picks = (case
		when (modecode = 1) then (picksLastRun)
		else null
	end)
where
	upper_inf(timestamp) returning modecode, (current_timestamp(3)-lower(timestamp)) into code, clock;

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
	motor = justify_hours(motor + clock)
where
	serialno is not null;
end if;

if code = 6 then
UPDATE
  clothlog
SET
	timestamp = tstzrange(
      lower(timestamp),
	current_timestamp(3),
	'[)'
  ),
	meters = (select
    val
  from
    tags
  where
    tag->>'name' = 'orderLength')
where
	event=1 and upper_inf(timestamp);
INSERT INTO clothlog VALUES(tstzrange(current_timestamp(3),NULL,'[)'),1,NULL);
end if;

return new;
end;

$function$
;
create trigger modeupdate before insert on modelog for row execute function modeupdate();
create or replace
function getstatinfo(starttime timestamp with time zone,
endtime timestamp with time zone)
 returns table(picks numeric,
meters numeric,
rpm numeric,
mph numeric,
efficiency numeric,
starts numeric,
runtime interval,
stops jsonb)
 language plpgsql
as $function$
begin
if exists (
select
	*
from
	modelog,
	lateral (
	select
		case
			when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
            tstzrange(lower(timestamp),
			current_timestamp,
			'[)')
			else
            timestamp
		end as tr) timerange
where
	tstzrange(starttime,
	endtime,
	'[)') && tr
) then
return QUERY (
with query as (
select
		sum(
case when not (timestamp &> tstzrange(starttime, endtime, '[)'))
then ceil(ppicks)
when (timestamp @> tstzrange(starttime, endtime, '[)'))
then round(ppicks)
when not (timestamp &< tstzrange(starttime, endtime, '[)'))
then
case when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
cpicks
else
floor(ppicks)
end
else modelog.picks
end
) as spicks,
	justify_hours(sum(dur)) as mototime,
	count(*) as runstarts,
		sum(case when upper_inf(timestamp) and durqs > exdurs then
cpicks * 6000 /(planspeed * (durqs-exdurs))
when durqs > exdurs then
ppicks * 6000 /(planspeed * (durqs-exdurs))
end ) as eff,
	sum(case when upper_inf(timestamp) then
cpicks /(100 * plandensity)
else
ppicks /(100 * plandensity)
end) as meter
from
		modelog,
		lateral (
	select
		case
			when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
            tstzrange(lower(timestamp),
			current_timestamp,
			'[)')
			else
            timestamp
		end as tr) timerange,
		lateral (
	select
		extract(epoch
	from
		(upper(tr)-lower(tr))) as durrs) rowsecduration,
		lateral (
	select
		upper(tr * tstzrange(starttime, endtime, '[)'))-lower(tr * tstzrange(starttime, endtime, '[)')) as dur) intduration,
		lateral (
	select
		extract(epoch
	from
		dur) as durs) intsecduration,
		lateral (
	select
		(durs / durrs) * modelog.picks as ppicks) partialpicks,
		lateral (
	select
		extract(epoch
	from
		case
			when (endtime > current_timestamp)
				and (starttime < current_timestamp) then
  (current_timestamp-starttime)
				when (endtime > current_timestamp)
					and (starttime > current_timestamp) then
  null
					else
  (endtime-starttime)
				end) as durqs) querysecduration,
		lateral(
	select
		sum((select upper(ts * tstzrange(starttime, endtime, '[)'))-lower(ts * tstzrange(starttime, endtime, '[)')))) as exdur
	from
		modelog,
		lateral (
		select
			case
				when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
              tstzrange(lower(timestamp),
				current_timestamp,
				'[)')
				else
              timestamp
			end as ts) timeranges
	where
		tstzrange(starttime,
		endtime,
		'[)') && ts
			and
    (modecode = 2
				or modecode = 0 or modecode = 6)) normstop,
	lateral (
	select
		coalesce((extract(epoch
	from
		exdur)), 0) as exdurs) normstopsecduration,
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
	'[)') && tr
		and modecode = 1
)
select
	query.spicks::numeric,
	query.meter::numeric,
	speedMainDrive::numeric,
	speedCloth::numeric,
	query.eff::numeric,
	query.runstarts::numeric,
	query.mototime,
	descrstop
from
	query,
	lateral(
	select
		round((query.spicks * 60)/(
        select
          extract(epoch
        from
          query.mototime) )) as speedMainDrive
    ) speedMainDrive,
	lateral(
	select
		query.meter /(
		select
			extract(epoch
		from
			query.mototime)/ 3600 ) as speedCloth) speedCloth,
	lateral (
      with t(num,
	stop) as (
	select
		*
	from
		(
	values (2,
    'button'),
    (6,
      'fabric'),
    (5,
      'tool'),
    (4,
      'weft'),
    (3,
    'warp'),
    (0,
      'other') ) as t(num,
		stop) )
	select
		jsonb_agg(json_build_object(t.stop, json_build_object('total', total , 'dur', justify_hours(dur)))) as descrstop
	from
		t,
		lateral(
		select
			count(*) as total,
			sum((select upper(tr * tstzrange(starttime, endtime, '[)'))-lower(tr * tstzrange(starttime, endtime, '[)')))) as dur
		from
			modelog,
			lateral (
			select
				case
					when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
                    tstzrange(lower(timestamp),
					current_timestamp,
					'[)')
					else
                    timestamp
				end as tr) timerange
		where
			tstzrange(starttime,
			endtime,
			'[)') && tr
				and modecode = t.num) stat) descrstops
);
end if;
end;

$function$
;
CREATE OR REPLACE FUNCTION monthreport(stime timestamp with time zone, etime timestamp with time zone)
 RETURNS TABLE(starttime timestamp with time zone, endtime timestamp with time zone, picks numeric, meters numeric, rpm numeric, mph numeric, efficiency numeric, starts numeric, runtime interval, stops jsonb)
 LANGUAGE plpgsql
AS $function$
begin
return QUERY (
with dates as (
select
	date as st,
	date + interval '24 hours' as et
from
	generate_series(
        stime,
        etime,
        '1 day'
    ) date
)
select
	st,
	et,
	data.picks,
  data.meters,
  data.rpm,
  data.mph,
  data.efficiency,
  data.starts,
  data.runtime,
  data.stops
from
	dates,getstatinfo(st,
	et) as data
);
end;

$function$
;
create or replace
function userreport(userid numeric,
stime timestamp with time zone,
etime timestamp with time zone)
 returns table(starttime timestamp with time zone,
endtime timestamp with time zone,
picks numeric,
meters numeric,
rpm numeric,
mph numeric,
efficiency numeric,
starts numeric,
runtime interval,
stops jsonb)
 language plpgsql
as $function$
begin
return QUERY (
with query as (
  with dates as (
select
	lower(tstzrange(stime, etime, '[)') * tr) as st,
	upper(tstzrange(stime, etime, '[)') * tr) as et
from
	userlog,
	lateral (
	select
			case
				when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
              tstzrange(lower(timestamp),
				current_timestamp,
				'[)')
			else
              timestamp
		end as tr) timerange
where
	id = userid
	and role = 'weaver'
	and tstzrange(stime,
	etime,
	'[)') && tr
    )
select
	dates.st as st,
	dates.et as et,
	spicks,
	meter,
	eff,
	runstarts,
	mototime
from
	dates,
	lateral (
	select
		sum(
        case when not (timestamp &> tstzrange(dates.st, dates.et, '[)'))
        then ceil(ppicks)
        when (timestamp @> tstzrange(dates.st, dates.et, '[)'))
        then round(ppicks)
        when not (timestamp &< tstzrange(dates.st, dates.et, '[)'))
        then
        case when upper_inf(timestamp) then
        cpicks
        else
        floor(ppicks)
        end
        else modelog.picks
        end
        ) as spicks,
		sum(case when upper_inf(timestamp) then
        cpicks /(100 * plandensity)
        else
        ppicks /(100 * plandensity)
        end ) as meter,
		sum(case when upper_inf(timestamp) then
        cpicks * 6000 /(planspeed * durqs)
        else
        ppicks * 6000 /(planspeed * durqs)
        end ) as eff,
		count(*) as runstarts,
		justify_hours(sum(dur)) as mototime
	from
		modelog,
		lateral (
		select
			case
				when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
              tstzrange(lower(timestamp),
				current_timestamp,
				'[)')
				else
              timestamp
			end as tr) timerange,
		lateral (
		select
			extract(epoch
		from
			(upper(tr)-lower(tr))) as durrs) rowsecduration,
		lateral (
		select
			upper(tr * tstzrange(dates.st, dates.et, '[)'))-lower(tr * tstzrange(dates.st, dates.et, '[)')) as dur) intduration,
		lateral (
		select
			extract(epoch
		from
			dur) as durs) intsecduration,
		lateral (
		select
			(durs / durrs) * modelog.picks as ppicks) partialpicks,
		lateral (
		select
			extract(epoch
		from
			(dates.et-dates.st)) as durqs) querysecduration,
		lateral (
		select
			val as cpicks
		from
			tags
		where
			(tag->>'name' = 'picksLastRun') ) currentpicks
	where
		tstzrange(dates.st,
		dates.et,
		'[)') && tr
			and modecode = 1
	) modedata

)
select
	query.st,
	query.et,
	query.spicks::numeric,
	query.meter::numeric,
	speedMainDrive::numeric,
	speedCloth::numeric,
	query.eff::numeric,
	query.runstarts::numeric,
	query.mototime,
	descrstop
from
	query,
	lateral(
	select
		round((query.spicks * 60)/(
        select
          extract(epoch
        from
          query.mototime) )) as speedMainDrive
    ) speedMainDrive,
	lateral(
	select
		query.meter /(
		select
			extract(epoch
		from
			query.mototime)/ 3600 ) as speedCloth) speedCloth,
	lateral (
      with t(num,
	stop) as (
	select
		*
	from
		(
	values
	(2,
	'button'),
  (6,
    'fabric'),
  (5,
    'tool'),
  (4,
    'weft'),
  (3,
	'warp'),
	(0,
    'other') ) as t(num,
		stop) )
	select
		jsonb_agg(json_build_object(t.stop, json_build_object('total', total , 'dur', justify_hours(dur)))) as descrstop
	from
		t,
		lateral(
		select
			count(*) as total,
			sum((select upper(tr * tstzrange(query.st, query.et, '[)'))-lower(tr * tstzrange(query.st, query.et, '[)')))) as dur
		from
			modelog,
			lateral (
			select
				case
					when upper_inf(timestamp) and current_timestamp>lower(timestamp) then
                    tstzrange(lower(timestamp),
					current_timestamp,
					'[)')
					else
                    timestamp
				end as tr) timerange
		where
			tstzrange(query.st,
			query.et,
			'[)') && tr
				and modecode = t.num) stat) descrstops
);
end;

$function$
;

create or replace
function getuserstatinfo(userid numeric,
starttime timestamp with time zone,
endtime timestamp with time zone)
 returns table(workdur interval,
picks numeric,
meters numeric,
rpm numeric,
mph numeric,
efficiency numeric,
starts numeric,
runtime interval,
stops jsonb)
 language plpgsql
as $function$
begin
if exists (
select
	*
from
	userreport(userid,
	starttime,
	endtime)) then
return QUERY (
with periods as (
select
	*
from
	userreport(userid,
	starttime,
	endtime)
)
select
	justify_hours(sum(upper(tstzrange(periods.starttime, periods.endtime, '[)'))-lower(tstzrange(periods.starttime, periods.endtime, '[)')))),
	sum(periods.picks),
	sum(periods.meters),
	round((sum(periods.picks) * 60)/(
        select
          extract(epoch
        from
          sum(periods.runtime)))),
	sum(periods.meters)/(
	select
		extract(epoch
	from
		sum(periods.runtime))/ 3600 ) ,
	sum(periods.picks) * 6000 / sum(periods.picks * 6000 / NULLIF(periods.efficiency,0)),
	sum(periods.starts),
	sum(periods.runtime),
	(
	select
		jsonb_agg(json_build_object(key, json_build_object('total', total , 'dur', dur)))
	from
		(
		select
			stopobj.key as key,
			sum(((stopobj.value::jsonb->>'total')::numeric)) as total,
			sum(((stopobj.value::jsonb->>'dur')::interval)) as dur
		from
			periods,
			lateral (
			select
				*
			from
				jsonb_array_elements(periods.stops)) stop ,
			lateral (
			select
				*
			from
				jsonb_each_text(stop.value) ) stopobj
		group by
			key) descrstop)
from
	periods
);
end if;
end;

$function$
;
create or replace
function usersreport( starttime timestamp with time zone,
endtime timestamp with time zone)
 returns table(userid integer,
workdur interval,
picks numeric,
meters numeric,
rpm numeric,
mph numeric,
efficiency numeric,
starts numeric,
runtime interval,
stops jsonb)
 language plpgsql
as $function$
begin
return QUERY (
with t(userid) as (
select
	id as userid
from
	users
where
	role = 'weaver'
order by
	name
)
select
	*
from
	t,
	public.getuserstatinfo(t.userid,
	starttime,
	endtime));
end;

$function$
;
create or replace
function shiftsreport(stime timestamp with time zone,
etime timestamp with time zone)
 returns table(shiftname text,
starttime timestamp with time zone,
endtime timestamp with time zone,
picks numeric,
meters numeric,
rpm numeric,
mph numeric,
efficiency numeric,
starts numeric,
runtime interval,
stops jsonb)
 language plpgsql
as $function$
begin
return QUERY (
with shifts as (
with dates as (
select
	date as st,
	date + interval '24 hours' as et
from
	generate_series(
        stime,
        etime,
        '1 day'
    ) date
)
select
	shiftconfig.shiftname,
	(dates.st::date + shiftconfig.starttime) as start ,
	((dates.st::date + shiftconfig.starttime) + shiftconfig.duration ) as
end
from
dates,
shiftconfig,
lateral (
select
	extract(ISODOW
from
	st) as dow ) dow
where
(monday
	and dow = 1)
or (tuesday
	and dow = 2)
or(wednesday
	and dow = 3)
or(thursday
	and dow = 4)
or(friday
	and dow = 5)
or(saturday
	and dow = 6)
or(sunday
	and dow = 7)
  )
select
	shifts.shiftname,
	shifts.start,
	shifts.end,
	data.picks,
	data.meters,
	data.rpm,
	data.mph,
	data.efficiency,
	data.starts,
	data.runtime,
	data.stops
from
	shifts,
	getstatinfo(shifts.start,
	shifts.end) as data
);
end;

$function$
;
CREATE TABLE IF NOT EXISTS reminders (
  id serial PRIMARY KEY,
  active boolean,
  title text,
  descr text,
  type smallint default 0,
  starttime timestamp with time zone default current_timestamp,
  runcondition numeric default 0.0,
  nexttime timestamp with time zone,
  nextrun numeric,
  acknowledged boolean default false
);
DROP TRIGGER IF EXISTS remupdate
  ON reminders;
DROP FUNCTION IF EXISTS remupdate;
create or replace function remupdate()
 returns trigger
 language plpgsql
as $function$
begin

if (TG_OP = 'UPDATE') then
  if old.type = 0 and (current_timestamp > (old.starttime + (interval '1' hour * old.runcondition))) then
    new.starttime := current_timestamp;
	  new.nexttime := current_timestamp + (interval '1' hour * new.runcondition);
    new.acknowledged := false;
  end if;
  if old.type = 1 and ((SELECT cloth from lifetime) > old.nextrun) then
    new.starttime := current_timestamp;
	  new.nextrun := new.runcondition*(floor((SELECT cloth from lifetime)/new.runcondition)+1);
    new.acknowledged := false;
  end if;
  if old.type = 2 and (extract(epoch from (SELECT motor from lifetime)) > old.nextrun) then
    new.starttime := current_timestamp;
	  new.nextrun := extract(epoch from (SELECT motor from lifetime)) + 3600 * new.runcondition;
    new.acknowledged := false;
  end if;
end if;

if (TG_OP = 'INSERT') then
	if (new.type=0) then
  		new.nexttime := new.starttime + (interval '1' hour * new.runcondition);
	end if;
	if (new.type=1) then
  		new.nextrun := new.runcondition*(floor((SELECT cloth from lifetime)/new.runcondition)+1);
	end if;
	if (new.type=2) then
  		new.nextrun := extract(epoch from (SELECT motor from lifetime)) + 3600 * new.runcondition;
	end if;
end if;
return new;
end;

$function$
;
create trigger remupdate before insert or update on reminders for row execute function remupdate();
CREATE OR REPLACE FUNCTION getactualnotifications()
 RETURNS SETOF reminders
 LANGUAGE plpgsql
AS $function$
begin
  UPDATE reminders SET acknowledged=acknowledged;
  RETURN QUERY(SELECT * FROM reminders where active=true and acknowledged=false and current_timestamp >= starttime and
	case
  when type=0 then current_timestamp <= nexttime
  when type=1 then (SELECT cloth from lifetime) <= nextrun
  when type=2 then extract(epoch from (SELECT motor from lifetime)) <= nextrun
  end
  );
end;

$function$
;
CREATE OR REPLACE FUNCTION getcurrentinfo(OUT tags jsonb, OUT rolls numeric, OUT shift jsonb, OUT lifetime jsonb, OUT weaver jsonb, OUT userinfo jsonb, OUT shiftinfo jsonb, OUT dayinfo jsonb, OUT monthinfo jsonb)
 RETURNS record
 LANGUAGE plpgsql
AS $function$
  begin

  tags :=(
select
	jsonb_agg(e)
from
	(
	select
		tag,
		(round(val::numeric,(tag->>'dec')::integer)) as val,
		updated,
		link
	from
		tags
	where
		tag->>'group' = 'monitoring'
		or link = false) e);

rolls :=(
select
	count(*)
from
	clothlog
where
	not upper_inf(timestamp)
		and timestamp && tstzrange(lower((select timestamp from clothlog where upper_inf(timestamp) and event = 0)),
		current_timestamp(3),
		'[)')
			and event = 1);

shift :=(select row_to_json(e)::jsonb from (select * from shiftdetect(current_timestamp)) e);

lifetime :=(select row_to_json(e)::jsonb from (select * from lifetime) e);

weaver :=(
select
	row_to_json(e)::jsonb
from
	(
	select
		id,
		name,
		case when lower(timestamp) < current_timestamp then lower(timestamp) else current_timestamp end as logintime
	from
		userlog
	where
		upper_inf(timestamp)
		and role = 'weaver') e);

userinfo :=(
select
	row_to_json(e)::jsonb
from
	(
	select
		*
	from
		getuserstatinfo((weaver->>'id')::numeric,
		(weaver->>'logintime')::timestamptz,
		current_timestamp)) e);

if (shift->>'shiftname' = '') is not false then
  	shiftinfo := null;
else
  	shiftinfo :=(select row_to_json(e)::jsonb|| json_build_object('start', (shift->>'shiftstart')::timestamptz , 'end', current_timestamp)::jsonb  from (select * from getstatinfo((shift->>'shiftstart')::timestamptz, current_timestamp)) e);
end if;

dayinfo :=(
select
	row_to_json(e)::jsonb || json_build_object('start', date_trunc('day', current_timestamp) , 'end', current_timestamp)::jsonb
from
	(
	select
		*
	from
		getstatinfo(date_trunc('day', current_timestamp),
		current_timestamp)) e );

monthinfo := (select row_to_json(e)::jsonb || json_build_object('start', date_trunc('month', current_timestamp) , 'end', current_timestamp)::jsonb  from (select * from getstatinfo(date_trunc('month', current_timestamp), current_timestamp)) e);

end;

$function$
;
CREATE OR REPLACE FUNCTION getpartialinfo(OUT tags jsonb, OUT shift jsonb, OUT weaver jsonb, OUT userinfo jsonb, OUT shiftinfo jsonb, OUT dayinfo jsonb, OUT monthinfo jsonb)
 RETURNS record
 LANGUAGE plpgsql
AS $function$
  begin

  tags :=(
select
	jsonb_agg(e)
from
	(
	select
		tag,
		(round(val::numeric,(tag->>'dec')::integer)) as val,
		updated,
		link
	from
		tags
	where
		tag->>'group' = 'monitoring'
		or link = false) e);

shift :=(select row_to_json(e)::jsonb from (select * from shiftdetect(current_timestamp)) e);

weaver :=(
select
	row_to_json(e)::jsonb
from
	(
	select
		id,
		name,
		case when lower(timestamp) < current_timestamp then lower(timestamp) else current_timestamp end as logintime
	from
		userlog
	where
		upper_inf(timestamp)
		and role = 'weaver') e);

userinfo :=(
select
	row_to_json(e)::jsonb
from
	(
	select
		picks, meters, rpm, mph, efficiency
	from
		getuserstatinfo((weaver->>'id')::numeric,
		(weaver->>'logintime')::timestamptz,
		current_timestamp)) e);

if (shift->>'shiftname' = '') is not false then
  	shiftinfo := null;
else
  	shiftinfo :=(select row_to_json(e)::jsonb|| json_build_object('start', (shift->>'shiftstart')::timestamptz , 'end', current_timestamp)::jsonb  from (select picks, meters, rpm, mph, efficiency from getstatinfo((shift->>'shiftstart')::timestamptz, current_timestamp)) e);
end if;

dayinfo :=(
select
	row_to_json(e)::jsonb || json_build_object('start', date_trunc('day', current_timestamp) , 'end', current_timestamp)::jsonb
from
	(
	select
		picks, meters, rpm, mph, efficiency
	from
		getstatinfo(date_trunc('day', current_timestamp),
		current_timestamp)) e );

monthinfo := (select row_to_json(e)::jsonb || json_build_object('start', date_trunc('month', current_timestamp) , 'end', current_timestamp)::jsonb  from (select picks, meters, rpm, mph, efficiency from getstatinfo(date_trunc('month', current_timestamp), current_timestamp)) e);

end;

$function$
;
`
export default createTableText
