const createTableText = `
CREATE TABLE IF NOT EXISTS hwconfig (
  name text PRIMARY KEY NOT NULL,
  data JSONB
);
CREATE TABLE IF NOT EXISTS tags (
  tag JSONB PRIMARY KEY NOT NULL,
  val NUMERIC,
  updated TIMESTAMPTZ not null default current_timestamp
);
CREATE INDEX IF NOT EXISTS idxgingroup ON tags USING gin ((tag -> 'group'));
CREATE INDEX IF NOT EXISTS idxginname ON tags USING gin ((tag -> 'name'));
CREATE INDEX IF NOT EXISTS idxgindev ON tags USING gin ((tag -> 'dev'));
CREATE INDEX IF NOT EXISTS idxgintype ON tags USING gin ((tag -> 'type'));
CREATE INDEX IF NOT EXISTS idxginreg ON tags USING gin ((tag -> 'reg'));
CREATE TABLE IF NOT EXISTS locales (
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
    timestamp TIMESTAMPTZ PRIMARY KEY not null default current_timestamp,
    modecode NUMERIC,
    picks NUMERIC,
    shiftname text
  );
  CREATE TABLE IF NOT EXISTS shiftconfig (
    shiftname text PRIMARY KEY not null,
    starttime TIME(0),
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
  function public.shiftdetect(stamp timestamp)
   returns text
   language plpgsql
  as $function$
     declare
     picks numeric;

  dow numeric;

  shift text;

  weekday text;

  prevweekday text;

  begin

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

  prevweekday := (case
    when dow = 1 then 'sunday'
    when dow = 2 then 'monday'
    when dow = 3 then 'tuesday'
    when dow = 4 then 'wednesday'
    when dow = 5 then 'thursday'
    when dow = 6 then 'friday'
    when dow = 7 then 'saturday'
  end);

  execute 'select shiftname from shiftconfig where ((' || weekday || ' or ' || prevweekday || ') and $1 >= make_timestamp(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime)::int,extract(minute from starttime)::int,0.0) and $1 < make_timestamp(extract(year from $1)::int,extract(month from $1)::int,extract(day from $1)::int,extract(hour from starttime)::int,extract(minute from starttime)::int,0.0)+duration) order by '
  into
    shift
      using stamp;

  return shift;
  end;

  $function$
  ;

create or replace
function modelog()
 returns trigger
 language plpgsql
as $function$
   declare
   picks numeric;

shift text;

begin
     if (new.val >= 2) then
       picks := (
select
	val
from
	tags
where
	(tag->>'name' = 'picksLastRun'));
else
       picks := null;
end if;

shift :=(
select
	shiftdetect());

insert
	into
	modelog
values(current_timestamp,
new.val,
picks,
shift);

return null;
end;

$function$
;


 DROP TRIGGER IF EXISTS modeChanged
  ON tags;
 create trigger modeChanged after insert or update on tags for row when (new.tag->>'name'='modeCode') execute function modelog();
`
export default createTableText
