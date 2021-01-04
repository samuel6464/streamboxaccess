/*
Copyright (c) 2010 - 2020 Annpoint, s.r.o.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-------------------------------------------------------------------------

NOTE: Requires the following acknowledgement (see also NOTICE):

This product includes DayPilot Modal (https://modal.daypilot.org).

*/

var local = {};

(function(DayPilot) {
  'use strict';

  if (typeof DayPilot.Locale !== "undefined") {
    return;
  }

  var replaceCharAt = function(str, index, character) {
    return str.substr(0, index) + character + str.substr(index + character.length);
  };

  DayPilot.Locale = function(id, config) {
    this.id = id;
    this.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.dayNamesShort = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    this.monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.monthNamesShort  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    this.datePattern = "M/d/yyyy";
    this.timePattern = "H:mm";
    this.dateTimePattern = "M/d/yyyy H:mm";
    this.timeFormat = "Clock12Hours";
    this.weekStarts = 0; // Sunday

    if (config) {
      for (var name in config) {
        this[name] = config[name];
      }
    }
  };

  DayPilot.Locale.all = {};

  DayPilot.Locale.find = function(id) {
    if (!id) {
      return null;
    }
    var normalized = id.toLowerCase();
    if (normalized.length > 2) {
      normalized = replaceCharAt(normalized, 2, '-');
    }
    return DayPilot.Locale.all[normalized];
  };

  DayPilot.Locale.register = function(locale) {
    DayPilot.Locale.all[locale.id] = locale;
  };

  DayPilot.Locale.register(new DayPilot.Locale('ca-es', {'dayNames':['diumenge','dilluns','dimarts','dimecres','dijous','divendres','dissabte'],'dayNamesShort':['dg','dl','dt','dc','dj','dv','ds'],'monthNames':['gener','febrer','març','abril','maig','juny','juliol','agost','setembre','octubre','novembre','desembre',''],'monthNamesShort':['gen.','febr.','març','abr.','maig','juny','jul.','ag.','set.','oct.','nov.','des.',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('cs-cz', {'dayNames':['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'],'dayNamesShort':['ne','po','út','st','čt','pá','so'],'monthNames':['leden','únor','březen','duben','květen','červen','červenec','srpen','září','říjen','listopad','prosinec',''],'monthNamesShort':['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII',''],'timePattern':'H:mm','datePattern':'d. M. yyyy','dateTimePattern':'d. M. yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('da-dk', {'dayNames':['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],'dayNamesShort':['sø','ma','ti','on','to','fr','lø'],'monthNames':['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'dd-MM-yyyy','dateTimePattern':'dd-MM-yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('de-at', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Jänner','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jän','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('de-ch', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('de-de', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('de-lu', {'dayNames':['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],'dayNamesShort':['So','Mo','Di','Mi','Do','Fr','Sa'],'monthNames':['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember',''],'monthNamesShort':['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('en-au', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'d/MM/yyyy','dateTimePattern':'d/MM/yyyy h:mm tt','timeFormat':'Clock12Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('en-ca', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd h:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('en-gb', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('en-us', {'dayNames':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],'dayNamesShort':['Su','Mo','Tu','We','Th','Fr','Sa'],'monthNames':['January','February','March','April','May','June','July','August','September','October','November','December',''],'monthNamesShort':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',''],'timePattern':'h:mm tt','datePattern':'M/d/yyyy','dateTimePattern':'M/d/yyyy h:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('es-es', {'dayNames':['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],'dayNamesShort':['D','L','M','X','J','V','S'],'monthNames':['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre',''],'monthNamesShort':['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('es-mx', {'dayNames':['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],'dayNamesShort':['do.','lu.','ma.','mi.','ju.','vi.','sá.'],'monthNames':['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre',''],'monthNamesShort':['ene.','feb.','mar.','abr.','may.','jun.','jul.','ago.','sep.','oct.','nov.','dic.',''],'timePattern':'hh:mm tt','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy hh:mm tt','timeFormat':'Clock12Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('eu-es', {'dayNames':['igandea','astelehena','asteartea','asteazkena','osteguna','ostirala','larunbata'],'dayNamesShort':['ig','al','as','az','og','or','lr'],'monthNames':['urtarrila','otsaila','martxoa','apirila','maiatza','ekaina','uztaila','abuztua','iraila','urria','azaroa','abendua',''],'monthNamesShort':['urt.','ots.','mar.','api.','mai.','eka.','uzt.','abu.','ira.','urr.','aza.','abe.',''],'timePattern':'H:mm','datePattern':'yyyy/MM/dd','dateTimePattern':'yyyy/MM/dd H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('fi-fi', {'dayNames':['sunnuntai','maanantai','tiistai','keskiviikko','torstai','perjantai','lauantai'],'dayNamesShort':['su','ma','ti','ke','to','pe','la'],'monthNames':['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu',''],'monthNamesShort':['tammi','helmi','maalis','huhti','touko','kesä','heinä','elo','syys','loka','marras','joulu',''],'timePattern':'H:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('fr-be', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd-MM-yy','dateTimePattern':'dd-MM-yy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('fr-ca', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd HH:mm','timeFormat':'Clock24Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('fr-ch', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('fr-fr', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('fr-lu', {'dayNames':['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],'dayNamesShort':['di','lu','ma','me','je','ve','sa'],'monthNames':['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre',''],'monthNamesShort':['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('gl-es', {'dayNames':['domingo','luns','martes','mércores','xoves','venres','sábado'],'dayNamesShort':['do','lu','ma','mé','xo','ve','sá'],'monthNames':['xaneiro','febreiro','marzo','abril','maio','xuño','xullo','agosto','setembro','outubro','novembro','decembro',''],'monthNamesShort':['xan','feb','mar','abr','maio','xuño','xul','ago','set','out','nov','dec',''],'timePattern':'H:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('it-it', {'dayNames':['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],'dayNamesShort':['do','lu','ma','me','gi','ve','sa'],'monthNames':['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre',''],'monthNamesShort':['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('it-ch', {'dayNames':['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'],'dayNamesShort':['do','lu','ma','me','gi','ve','sa'],'monthNames':['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre',''],'monthNamesShort':['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('ja-jp', {'dayNames':['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'],'dayNamesShort':['日','月','火','水','木','金','土'],'monthNames':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月',''],'monthNamesShort':['1','2','3','4','5','6','7','8','9','10','11','12',''],'timePattern':'H:mm','datePattern':'yyyy/MM/dd','dateTimePattern':'yyyy/MM/dd H:mm','timeFormat':'Clock24Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('ko-kr', {'dayNames':['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],'dayNamesShort':['일','월','화','수','목','금','토'],'monthNames':['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월',''],'monthNamesShort':['1','2','3','4','5','6','7','8','9','10','11','12',''],'timePattern':'tt h:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd tt h:mm','timeFormat':'Clock12Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('nb-no', {'dayNames':['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'],'dayNamesShort':['sø','ma','ti','on','to','fr','lø'],'monthNames':['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember',''],'monthNamesShort':['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('nl-nl', {'dayNames':['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],'dayNamesShort':['zo','ma','di','wo','do','vr','za'],'monthNames':['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'d-M-yyyy','dateTimePattern':'d-M-yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('nl-be', {'dayNames':['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'],'dayNamesShort':['zo','ma','di','wo','do','vr','za'],'monthNames':['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mrt','apr','mei','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'H:mm','datePattern':'d/MM/yyyy','dateTimePattern':'d/MM/yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('nn-no', {'dayNames':['søndag','måndag','tysdag','onsdag','torsdag','fredag','laurdag'],'dayNamesShort':['sø','må','ty','on','to','fr','la'],'monthNames':['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember',''],'monthNamesShort':['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des',''],'timePattern':'HH:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('pt-br', {'dayNames':['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],'dayNamesShort':['D','S','T','Q','Q','S','S'],'monthNames':['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro',''],'monthNamesShort':['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('pl-pl', {'dayNames':['niedziela','poniedziałek','wtorek','środa','czwartek','piątek','sobota'],'dayNamesShort':['N','Pn','Wt','Śr','Cz','Pt','So'],'monthNames':['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień',''],'monthNamesShort':['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru',''],'timePattern':'HH:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('pt-pt', {'dayNames':['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'],'dayNamesShort':['D','S','T','Q','Q','S','S'],'monthNames':['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro',''],'monthNamesShort':['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez',''],'timePattern':'HH:mm','datePattern':'dd/MM/yyyy','dateTimePattern':'dd/MM/yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':0}));
  DayPilot.Locale.register(new DayPilot.Locale('ro-ro', {'dayNames':['duminică','luni','marți','miercuri','joi','vineri','sâmbătă'],'dayNamesShort':['D','L','Ma','Mi','J','V','S'],'monthNames':['ianuarie','februarie','martie','aprilie','mai','iunie','iulie','august','septembrie','octombrie','noiembrie','decembrie',''],'monthNamesShort':['ian.','feb.','mar.','apr.','mai.','iun.','iul.','aug.','sep.','oct.','nov.','dec.',''],'timePattern':'H:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('ru-ru', {'dayNames':['воскресенье','понедельник','вторник','среда','четверг','пятница','суббота'],'dayNamesShort':['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],'monthNames':['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',''],'monthNamesShort':['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек',''],'timePattern':'H:mm','datePattern':'dd.MM.yyyy','dateTimePattern':'dd.MM.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('sk-sk', {'dayNames':['nedeľa','pondelok','utorok','streda','štvrtok','piatok','sobota'],'dayNamesShort':['ne','po','ut','st','št','pi','so'],'monthNames':['január','február','marec','apríl','máj','jún','júl','august','september','október','november','december',''],'monthNamesShort':['1','2','3','4','5','6','7','8','9','10','11','12',''],'timePattern':'H:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy H:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('sv-se', {'dayNames':['söndag','måndag','tisdag','onsdag','torsdag','fredag','lördag'],'dayNamesShort':['sö','må','ti','on','to','fr','lö'],'monthNames':['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december',''],'monthNamesShort':['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec',''],'timePattern':'HH:mm','datePattern':'yyyy-MM-dd','dateTimePattern':'yyyy-MM-dd HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('tr-tr', {'dayNames':['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],'dayNamesShort':['Pz','Pt','Sa','Ça','Pe','Cu','Ct'],'monthNames':['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',''],'monthNamesShort':['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara',''],'timePattern':'HH:mm','datePattern':'d.M.yyyy','dateTimePattern':'d.M.yyyy HH:mm','timeFormat':'Clock24Hours','weekStarts':1}));
  DayPilot.Locale.register(new DayPilot.Locale('zh-cn', {'dayNames':['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],'dayNamesShort':['日','一','二','三','四','五','六'],'monthNames':['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月',''],'monthNamesShort':['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月',''],'timePattern':'H:mm','datePattern':'yyyy/M/d','dateTimePattern':'yyyy/M/d H:mm','timeFormat':'Clock24Hours','weekStarts':1}));

  DayPilot.Locale.US = DayPilot.Locale.find("en-us");

})(local);

const {Locale} = local;

export {Locale};
