#! /usr/bin/env python



import sys, copy, Data

from bsddb import hashopen

from cPickle import loads

from mx import DateTime

import ucanCallMethods

import evap_station_list

import art_stat

from station_searches import getHourlyStaInfo

from get_precipamt_forecast import get_precipamt_forecast



ucan = ucanCallMethods.general_ucan()

data = ucan.get_data()



miss = -999

month_name = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

day_name = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

var_dict = {'prcp': [ 5,'inch',      '%4.2f'], 'altp': [17,'inch_Hg','%6.3f'], 

			'stpr': [18,'inch_Hg',   '%6.3f'], 'slpr': [19,'inch_Hg','%6.3f'], 

			'dwpt': [22,'degF',      '%4.0f'], 'temp': [23,'degF',   '%4.0f'], 

			'rhum': [24,None,        '%3.0f'], 'wetb': [25,'degF',   '%4.0f'], 

			'visi': [26,'miles',     '%5.2f'], 'wdir': [27,'degrees','%3.0f'],

            'wspd': [28,'miles/hour','%3.0f'], 'wtyp': [20,'','%{abbr}s'],

			'ccnd': [30,'',       '%{abbr}s'], 'chgt': [31,'feet',   '%.0f '],

			'tsky': [33,'count',     '%3.1f'], 'srad': [99,'langleys'  ,'%6.2f'] }

not_wet = ['FU','VA','DU','SA','HZ','PO','FC','SS','DS','SQ']

            

def print_exception(type=None, value=None, tb=None, limit=None):

	if type is None:

		type, value, tb = sys.exc_info()

	import traceback

	output = ['Traceback (innermost last): '] 

	list = traceback.format_tb(tb, limit) + traceback.format_exception_only(type, value)

	for item in list: print item

	return



def get_input():

	if len(sys.argv) == 2:

		mdy = (sys.argv[1].strip()).split(",")

		for i in range(len(mdy)):

			mdy[i] = int(mdy[i])

		end_date_dt = DateTime.DateTime(mdy[2],mdy[0],mdy[1])

	else:

	#	default end today

		end_date_dt = DateTime.now()

	return end_date_dt

	

def initHourlyVar (stn, var):

	v = None

	major,units,format = var_dict[var]

	try:

		v = data.newTSVarNative (major,0,stn)

		if units: v.setUnits (units)

		v.setMissingDataAsFloat(miss)

		v.setMissingDataAsString("%s"%miss)

	except:

		print stn,"- Error initializing:",var

		print_exception()

	return v



def getHourlyVars (stn, var, v, start_date, end_date):

	values = []

	vdates = []

	try:

		v.setDateRange(start_date,end_date)

		vdates = v.getDateArraySeq()

		if var == 'wtyp':

			v.setDataStringFormat ('%{abbr}s')

			values = v.getDataSeqAsString()

			for w in range(len(values)):

				values[w]= values[w].split()

		else:

			values = v.getDataSeqAsFloat()

	except Data.TSVar.UnavailableDateRange:

		print stn,var,"- Unavailable date range; station being skipped"

	except:

		print stn,"- Error processing:",var

		print_exception()

	return values, vdates



def estmiss (var,hindx):

#	estimate missing values using average of previous and next good value within three hours

#	of time in question. If no data in this period, use a backup station.

	listlen = len(var)	

	chk = hindx

	prev = miss

	while prev == miss:

		chk = chk-1

		if chk < hindx-3 or chk <0:

			break

		else:

			prev = var[chk]

	chk = hindx

	next = miss

	while next == miss:

		chk = chk+1

		if chk > hindx+3 or chk >= listlen:

			break

		else:

			next = var[chk]

	if next == miss:

		next = prev

	elif prev == miss:

		prev = next

	if next != miss and prev != miss:

		replacement = (next+prev)/2.

	else:

		replacement = miss

	return (replacement)

	

#def rewrite_controls (dis,start_date_dt,end_date_dt):

#	# convert date to best-looking string

#	sMonName = month_name[start_date_dt.month - 1]

#	eMonName = month_name[end_date_dt.month - 1]

#	if start_date_dt == end_date_dt:

#		dateline = "Valid: %s, %s %s, %s" % (day_name[start_date_dt.weekday()],sMonName,start_date_dt.day,start_date_dt.year)

#	elif end_date_dt.year != start_date_dt.year:

#		dateline = "%s %s, %s-%s %s, %s" % (sMonName,start_date_dt.day,start_date_dt.year,eMonName,end_date_dt.day,end_date_dt.year)

#	elif end_date_dt.month != start_date_dt.month:

#		dateline = "%s %s-%s %s, %s" % (sMonName,start_date_dt.day,eMonName,end_date_dt.day,end_date_dt.year)

#	else:

#		dateline = "%s %s-%s, %s" % (sMonName,start_date_dt.day,end_date_dt.day,end_date_dt.year)

#	# read what is currently in file

#	ctrlname = dis+'_controls.txt'

#	prevfil = open(ctrlname,'r')

#	prevlines = prevfil.readlines()		

#	prevfil.close()

#	# rewrite file, updating the date

#	ctrlfil = open(ctrlname,'w')

#	for line in prevlines:

#		cols = line.split("\t")

#		if len(cols) == 2:

#			para = (cols[0]).strip()

#			if para == 'dateline':

#				ctrlfil.write("%s\t%s\n" % (para,dateline))

#			else:

#				ctrlfil.write(line)

#		else:

#			print "Unexpected line:",line

#	ctrlfil.close()

#	return

	

def rewrite_controls2 (ctrlfil,start_date_dt,end_date_dt):

	if start_date_dt == end_date_dt:

		dateline = "%s,%s,%s" % (start_date_dt.year,start_date_dt.month,start_date_dt.day)

	else:

		dateline = "%s,%s,%s\t%s,%s,%s" % (start_date_dt.year,start_date_dt.month,start_date_dt.day,\

					end_date_dt.year,end_date_dt.month,end_date_dt.day)

	ctrlfil.write("%s\n" % dateline)



#def updateControlFiles (request_dt):

#	# update date in control files	

#	start_date_dt = request_dt + DateTime.RelativeDate(days=-6)

#	end_date_dt = request_dt

#	for dis in ['bptch','anthr','pblit','dspot','hstress']:

#		rewrite_controls(dis,start_date_dt,end_date_dt)

#	fx_start_date_dt = request_dt + DateTime.RelativeDate(days=+1)

#	fx_end_date_dt = request_dt + DateTime.RelativeDate(days=+6)

#	for dis in ['anthr_fcst','bptch_fcst','pblit_fcst','dspot_fcst','hs_fcst']:

#		rewrite_controls (dis,fx_start_date_dt,fx_end_date_dt)

#	theDate = fx_start_date_dt

#	for dcnt in range (1,7):

#		for dis in ['hs_fcstd%s'%dcnt,'anthr_fcstd%s'%dcnt,'pblit_fcstd%s'%dcnt,\

#		            'bptch_fcstd%s'%dcnt,'dspot_fcstd%s'%dcnt,]:

#			rewrite_controls(dis,theDate,theDate)

#		theDate = theDate + DateTime.RelativeDate(days=+1)

#	return

		

def index_to_risk (dis,index_value):

	risk_value = 0

	if index_value == miss: 

		risk_value = miss

	else:

		if dis == 'anth':

			if index_value > 0.4 and index_value <= 1.5:

				risk_value=1

			elif index_value > 1.5:

				risk_value=2

		elif dis == 'pblight':

			if index_value > 0.4 and index_value <= 3.6:

				risk_value=1

			elif index_value > 3.6:

				risk_value=2			

		elif dis == 'bpatch':

			if index_value > 0.4 and index_value <= 0.9:

				risk_value=1

			elif index_value > 0.9:

				risk_value=2

		elif dis == 'dspot':

			if index_value > 0.4 and index_value <= 0.7:

				risk_value=1

			elif index_value > 0.7:

				risk_value=2

		elif dis == 'hstress':

			hs_total = 0

			risk_value = 0

			for dlyval in index_value:					#list in this case

				if dlyval == miss:

					risk_value = miss

					break

				else:

					if dlyval > 2 and risk_value < 2:

						risk_value = 1

					if dlyval >= 5:

						risk_value = 2

						break

					elif dlyval >= 3 and dlyval <= 4:

						hs_total = hs_total + 1

						if hs_total >= 5:

							risk_value = 2

							break

						elif risk_value < 2: 

							risk_value = 1

	return risk_value



def disease_calcs(begin_list,temp_list,precip_list,tempc_list,wet_list,rh_list,wx_list,start_date_dt,end_date_dt):

	risk = [miss,miss,miss,miss]

	fx_risk = [miss,miss,miss,miss]

	dly_risk = []

	for i in range(0,6):

		dly_risk.append([miss,miss,miss,miss])

	try:

		index = {}

		index['anth'] = []

		index['pblight'] = []

		index['bpatch'] = []

		index['dspot'] = []

			

#		dollar_rh = 0       I believe that this should be initialized in the day-loop -kle 2/23/2010

		cons_rain = [0,0,0]

		

		switch_date = DateTime.DateTime(end_date_dt.year,07,01)

		switch_date2 = DateTime.DateTime(end_date_dt.year,9,30)		

	

#		2/2010 - changed end of loop from len(begin_list)-1 to len(begin_list) - kle

		for day in range (3,len(begin_list)):

			wet_count = 0                   #

			wet_count1 = 0					#

			rh_89 = 0						#

			rh_95 = 0						#

			rain_cnt = 0					#

			dollar_rh = 0					# moved from outside loop -kle 2/23/2010

			

			avg_t = art_stat.avger(tempc_list[begin_list[day-3]:begin_list[day]])     #  3-day temp average

	  

			for val in range(begin_list[day-3],begin_list[day]):					  	  #

				if wet_list[val] == miss or wet_count == miss:							  #	

					wet_count = miss													  #	

				else:																	  #	

					wet_count = wet_count + wet_list[val]								  #  3-day total wetness hours

			for val in range(begin_list[day-1],begin_list[day]):						  #	

				if wet_list[val] == miss or wet_count1 == miss:							  #	

					wet_count1 = miss													  #	

				else:						  											  #	

					wet_count1 = wet_count1 + wet_list[val]								  #



			if wet_count != miss:

				wet_count = wet_count/3.



			#anth calculation			

			if wet_count != miss and avg_t != miss:

				anth_index = 4.0233-(0.2283*wet_count)-(0.5308*avg_t)-(0.0013*wet_count**2)+(0.0197*avg_t**2)+(0.0155*avg_t*wet_count)	

		

				if avg_t < 0: anth_index = -1  ## prevents positive index at temp < 0 C

			

				if wet_count < 8:

					anth_index = anth_index - 3

			else:

				anth_index = miss

			

			for val in range (begin_list[day-1],begin_list[day]):

				if rh_list[val] == miss:

					rh_89 = miss

					rh_95 = miss

				else:

					if rh_list[val] > 89 and rh_89 != miss: rh_89 = rh_89 +1 		#

					if rh_list[val] > 95 and rh_95 != miss: rh_95 = rh_95 +1		#

					

				rain = -1

				driz = -1

				for wx in range(len(wx_list[val])):

					if wx_list[val][wx].find('RA')<>-1:rain = 1						#

					if wx_list[val][wx].find('DZ')<>-1:driz = 1						#

				

				if rain <>-1 or precip_list[val] <> 0 or driz <>-1:

					rain_cnt = rain_cnt + 1

	

			min_t = min(temp_list[begin_list[day-1]:begin_list[day]])				#

			max_t = max(temp_list[begin_list[day-1]:begin_list[day]])				#

			

			#pblight calculation

			if max_t != miss and min_t != miss and rh_89 != miss:

				pblight_index = (max_t - 86) + (min_t-68) + 0.5*(rh_89-6)			#

			else:

				pblight_index = miss



			if rh_95 == miss:               #

				rh95_bp = miss              #

			elif rh_95 >=8:                 #

				rh95_bp = 2					#

			elif rh_95 > 4:					#

				rh95_bp = 1					#

			else:							#

				rh95_bp = 0					#

			

			avg_rh = art_stat.avger(rh_list[begin_list[day-1]:begin_list[day]])    #

			if avg_rh == miss:              #

				rhavg_bp = miss	            #		

			elif avg_rh >=80:               #

				rhavg_bp = 1				#

			else:							#

				rhavg_bp = 0				#

			

			if wet_count1 == miss:          #

				leaf_bp = miss	            #

			elif wet_count1 > 10:           #

				leaf_bp = 1				    #

			else:							#

				leaf_bp = 0				    #

		

			min_tc = min(tempc_list[begin_list[day-1]:begin_list[day]])			   #

			if min_tc == miss:              #

				mint_bp = miss              # 

			elif min_tc >= 16:              #

				mint_bp = 1				    #

			elif (start_date_dt + DateTime.RelativeDate(days=+day)) < switch_date:	#

				mint_bp = -4                #

			elif (start_date_dt + DateTime.RelativeDate(days=+day)) > switch_date2:	#

				mint_bp = -4                #

			else:							#

				mint_bp = -2				#



			#bpatch calculation				

			if rh95_bp != miss and rhavg_bp != miss and leaf_bp != miss and mint_bp != miss:

				bpatch = rh95_bp + rhavg_bp + leaf_bp + mint_bp          #

			else:

				bpatch = miss

						

			avg_t1 = art_stat.avger(tempc_list[begin_list[day-1]:begin_list[day]])



			max_rh = max(rh_list[begin_list[day-1]:begin_list[day]])			   #

			

			cons_rain.append(rain_cnt)

			

			rain_row = 0     										#

			if day>=5:												#

				for lday in range (0,6):							#

					if cons_rain[day-lday]<>0:						#

						rain_row=rain_row+1							#

					else:											#

						break  										#

			

			if rain_row<>0:	

				avg_t2 = art_stat.avger(tempc_list[begin_list[day-rain_row]:begin_list[day]])

			else:

				avg_t2 = 0



			#dspot calculation

			if max_rh != miss and wet_count != miss and avg_t1 != miss and avg_t2 != miss and rain_row != miss:				

				if max_rh > 90 and avg_t1 > 25: dollar_rh = dollar_rh + 1			   #

				if dollar_rh >=3:

					dspot1 = 1   #dollar_rh

				else:

					dspot1 = 0

		

				if wet_count >14 and avg_t1 > 15:

					dspot3 = 1

				else:

					dspot3 = 0

				

				if (rain_row >=2 and avg_t2 >20) or (rain_row>=3 and avg_t2>15):

					dspot2 = 1

				else:

					dspot2 = 0

					

				d_spot = dspot1+dspot2+dspot3

			else:

				d_spot = miss



			index['anth'].append(anth_index)

			index['pblight'].append(pblight_index)

			index['bpatch'].append(bpatch)

			index['dspot'].append(d_spot)

			

#		current 7-day average

		risk[0] = index_to_risk('anth', art_stat.avger(index['anth'][0:7]))

		risk[1] = index_to_risk('pblight', art_stat.avger(index['pblight'][0:7]))

		risk[2] = index_to_risk('bpatch', art_stat.avger(index['bpatch'][0:7]))

		risk[3] = index_to_risk('dspot', art_stat.avger(index['dspot'][0:7]))

#		forecast 6-day average

		fx_risk[0] = index_to_risk('anth', art_stat.avger(index['anth'][7:13]))

		fx_risk[1] = index_to_risk('pblight', art_stat.avger(index['pblight'][7:13]))

		fx_risk[2] = index_to_risk('bpatch', art_stat.avger(index['bpatch'][7:13]))

		fx_risk[3] = index_to_risk('dspot', art_stat.avger(index['dspot'][7:13]))

#		save daily risks - 3 day averages

		for i in range(0,6):

			dly_risk[i][0] = index_to_risk('anth', index['anth'][i+7])

			if index['pblight'][i+7] != miss and index['pblight'][i+6] != miss and index['pblight'][i+5] != miss:

				dly_risk[i][1] = index_to_risk('pblight', (index['pblight'][i+7]+index['pblight'][i+6]+index['pblight'][i+5])/3.)

			else:

				dly_risk[i][1] = miss

			if index['bpatch'][i+7] != miss and index['bpatch'][i+6] != miss and index['bpatch'][i+5] != miss:

				dly_risk[i][2] = index_to_risk('bpatch', (index['bpatch'][i+7]+index['bpatch'][i+6]+index['bpatch'][i+5])/3.)

			else:

				dly_risk[i][2] = miss

			if index['dspot'][i+7] != miss and index['dspot'][i+6] != miss and index['dspot'][i+5] != miss:

				dly_risk[i][3] = index_to_risk('dspot', (index['dspot'][i+7]+index['dspot'][i+6]+index['dspot'][i+5])/3.)

			else:

				dly_risk[i][3] = miss

	except:

		print 'Error in disease_calcs'

		print_exception()

	return risk, fx_risk, dly_risk

	

def hstress_calcs(temp_list,rh_list,start_date_dt,end_date_dt):

	risk = miss

	fx_risk = miss

	dly_risk = []

	try:

		results_dict = {}

		results_dict['values'] = []

#		results_dict['dates'] = []

		stress_hrs = 0.0

		dly_miss = 0

		# process data hourly	

		theDate = start_date_dt

		hindx = 0

		while theDate <= end_date_dt:

			# do hourly calculations

			if theDate.hour >= 20 or theDate.hour <= 8:

				if len(temp_list) > hindx and len(rh_list) > hindx:

					tempv = temp_list[hindx]

					rhumv = rh_list[hindx]

					if tempv != miss and rhumv != miss:

						if tempv >= 70 and (tempv+rhumv) > 150: stress_hrs = stress_hrs+1

					else:

						dly_miss = dly_miss + 1

				else:

					dly_miss = dly_miss + 1

			# end of "day" update

			if theDate.hour == 8:

				# save daily values

				if dly_miss > 1:						#allow 1 missing hour

					results_dict['values'].append(miss)

					dly_risk.append(miss)

				else:

					results_dict['values'].append(stress_hrs)

					# calc risk for daily forecasts

					if stress_hrs < 2:

						dly_risk.append(0)

					elif stress_hrs >= 2 and stress_hrs <= 5:

						dly_risk.append(1)

					else:

						dly_risk.append(2)

#					results_dict['dates'].append((theDate.year,theDate.month,theDate.day))

				# reset daily accumulaters

				stress_hrs = 0.0

				dly_miss = 0

			theDate = theDate + DateTime.RelativeDate(hours=+1)

			hindx = hindx+1



#		current 7-day risk

		risk = index_to_risk ('hstress',results_dict['values'][0:7])

#		forecast 6-day risk

		fx_risk = index_to_risk ('hstress',results_dict['values'][7:13])	

	except:

		print "Error in hstress_calcs"

		print_exception()

	return risk, fx_risk, dly_risk[7:13]

	

###############################################################################



request_dt = get_input()

start_date_dt = request_dt + DateTime.RelativeDate(days=-9)

# 2/2010 - changed from hours=-1 to hour=7

start_date_dt=start_date_dt+DateTime.RelativeDate(hour=7)

short_start = start_date_dt.tuple()[:4]



end_date_dt = start_date_dt + DateTime.RelativeDate(hours=+362)  #15 days plus 2 hours (for heat stress forecasts)

short_end = end_date_dt.tuple()[:4]



lldict = {}

disease_stn = evap_station_list.stn_list

for stn in range(len(disease_stn)):

	name,lat,lon,gmt_offset = getHourlyStaInfo(disease_stn[stn][0])

	lldict[disease_stn[stn][0]]=[disease_stn[stn][1],lat,lon,disease_stn[stn][3]]



anth_risk    = open('anthr_map_out.txt','w')

pblight_risk = open('pblit_map_out.txt','w')

bpatch_risk  = open('bptch_map_out.txt','w')

dspot_risk   = open('dspot_map_out.txt','w')

hs_file      = open('hstress_map_out.txt','w')

anth_fcst_risk    = open('anthr_fcst_map_out.txt','w')

pblight_fcst_risk = open('pblit_fcst_map_out.txt','w')

bpatch_fcst_risk  = open('bptch_fcst_map_out.txt','w')

dspot_fcst_risk   = open('dspot_fcst_map_out.txt','w')

hs_fcst_file      = open('hs_fcst_map_out.txt','w')

hs_fx_day = {}

anthr_fx_day = {}

pblit_fx_day = {}

bptch_fx_day = {}

dspot_fx_day = {}

for i in range(1,7):

	hs_fx_day[i] = open('hs_fcstd%s_map_out.txt'%i,'w')

	anthr_fx_day[i] = open('anthr_fcstd%s_map_out.txt'%i,'w')

	pblit_fx_day[i] = open('pblit_fcstd%s_map_out.txt'%i,'w')

	bptch_fx_day[i] = open('bptch_fcstd%s_map_out.txt'%i,'w')

	dspot_fx_day[i] = open('dspot_fcstd%s_map_out.txt'%i,'w')



for infile in [anth_risk,pblight_risk,bpatch_risk,dspot_risk,hs_file]:

	rewrite_controls2 (infile,request_dt + DateTime.RelativeDate(days=-6),request_dt)

fx_start_date_dt = request_dt + DateTime.RelativeDate(days=+1)

fx_end_date_dt = request_dt + DateTime.RelativeDate(days=+6)

for infile in [anth_fcst_risk,pblight_fcst_risk,bpatch_fcst_risk,dspot_fcst_risk,hs_fcst_file]:

	rewrite_controls2 (infile,fx_start_date_dt,fx_end_date_dt)

theDate = fx_start_date_dt

for i in range(1,7):

	rewrite_controls2(hs_fx_day[i],theDate,theDate)

	rewrite_controls2(anthr_fx_day[i],theDate,theDate)

	rewrite_controls2(pblit_fx_day[i],theDate,theDate)

	rewrite_controls2(bptch_fx_day[i],theDate,theDate)

	rewrite_controls2(dspot_fx_day[i],theDate,theDate)

	theDate = theDate + DateTime.RelativeDate(days=+1)

	

begin_list = []

list_index = 0

theDate = start_date_dt

while theDate <= end_date_dt:

	if theDate.hour == 6:

		begin_list.append(list_index)

##		print list_index,theDate

	list_index = list_index + 1

	theDate = theDate + DateTime.RelativeDate(hours=+1)

begin_list.append(int((end_date_dt-start_date_dt).hours))

##print 'Begin_list:',begin_list



#Open forecast database

forecast_db = hashopen('/Users/kle1/NDFD/hourly_forecasts.db','r')



for stn in lldict.keys():

####for stn in ['KSYR']:

	backup = lldict[stn][0]

	values = {}

	dates = {}

	temp_list = []

	precip_list=[]

	dew_list = []

	wx_list = []

	tempc_list = []

	wet_list = []

	rh_list = []

	temp_miss = []

	dew_miss = []

	precip_miss = []

	rh_miss = []

	

#	get hourly data

	tsvok = 1

	for v in ['temp','dwpt','prcp','wtyp','rhum']:

		# setup necessary TSVar

		tsv = None

		tsv = initHourlyVar (stn, v)

		if tsv:

			# get necessary hourly data for the period

			values[v],dates[v] = getHourlyVars(stn,v,tsv,short_start,short_end)

			# release TSVar	

			tsv.release()

			tsv = None

			# check for existence of data

			if len(values[v]) == 0:

				tsvok = 0

				break

			# check for correct start time

			if list(short_start) != dates[v][0]:

				sys.stdout.write ('%s - Start of %s data does not match requested start date! Skipping ...\n'%(stn,v))

				tsvok = 0

				break

	if not tsvok: continue

	

	prcp_forecasts = []

	prcp_forecasts = get_precipamt_forecast(forecast_db,stn,start_date_dt,end_date_dt)

	if (len(values['temp'])-len(prcp_forecasts)) != -1: print "Unexpected list length difference"



#	build data lists

	for ob in range(len(values[values.keys()[0]])):  

		for var in values.keys():

			if var == 'temp':

				temp_miss.append(values[var][ob])

			if var == 'dwpt':

				dew_miss.append(values[var][ob])			

			if var == 'prcp':

				precip_miss.append(values[var][ob])

			if var == 'rhum':

				rh_miss.append(values[var][ob])

			

			good_type = 0

			if var == 'wtyp':

				if 'miss' in values[var][ob]:

					wx = ['NONE']

				else:

					if len(values[var][ob])<>0:

						for num in range(len(values[var][ob])):

							good_type = len(values[var][ob])

							for phen in not_wet:		

								if values[var][ob][num].find(phen)<>-1:good_type = good_type-1

							if good_type == 0:					

								wx = ['NONE']

							else:

								wx = values[var][ob]

					else:

						wx = ['NONE']

				wx_list.append(wx)

	

#	keep xxxx_miss so estimates are not used to estimate other missing values

	temp_list = copy.deepcopy(temp_miss)

	dew_list = copy.deepcopy(dew_miss)

	precip_list = copy.deepcopy(precip_miss)

	rh_list = copy.deepcopy(rh_miss)

	

	temp0_bckp = None

	dwpt0_bckp = None

	prcp0_bckp = None

	rhum0_bckp = None

	last_wet = 0

	stn_dict = loads(forecast_db[stn])



	for ob in range(len(temp_miss)):

		bsd = (start_date_dt+DateTime.RelativeDate(hours=+ob)).tuple()[:4]

		bed = (start_date_dt+DateTime.RelativeDate(hours=+(ob+1))).tuple()[:4]

		

#		fill in missing obs

		if temp_miss[ob] == miss:

			try:

				temp_list[ob] = stn_dict['temp'][bsd[0:3]][bsd[3]]

			except KeyError:

				pass

				

#			print stn,'Estimate of missing temp',bsd,temp_list[ob]

			if temp_list[ob] == miss:

				temp_list[ob] = estmiss(temp_miss,ob)

				if temp_list[ob] == miss:

					if not temp0_bckp: temp0_bckp = initHourlyVar(backup,'temp')

					temp_ret,dts = getHourlyVars(backup,'temp',temp0_bckp,bsd,bed)

					if len(temp_ret) > 0: temp_list[ob]=temp_ret[0]

		temp = temp_list[ob]

		if dew_miss[ob] == miss:

			try:

				dew_list[ob] = stn_dict['dwpt'][bsd[0:3]][bsd[3]]

			except KeyError:

				pass

#			print stn,'Estimate of missing dewpt',bsd,dew_list[ob]

			if dew_list[ob] == miss:

				dew_list[ob] = estmiss(dew_miss,ob)

				if dew_list[ob] == miss:

					if not dwpt0_bckp: dwpt0_bckp = initHourlyVar(backup,'dwpt')

					dew_ret,dts = getHourlyVars(backup,'dwpt',dwpt0_bckp,bsd,bed)

					if len(dew_ret) > 0: dew_list[ob]=dew_ret[0]

		dew = dew_list[ob]

		if rh_miss[ob] == miss:

			try:

				rh_list[ob] = stn_dict['rhum'][bsd[0:3]][bsd[3]]

			except KeyError:

				pass

#			print stn,'Estimate of missing rh',bsd,rh_list[ob]

			if rh_list[ob] == miss:

				rh_list[ob] = estmiss(rh_miss,ob)

				if rh_list[ob] == miss:

					if not rhum0_bckp: rhum0_bckp = initHourlyVar(backup,'rhum')

					rh_ret,dts = getHourlyVars(backup,'rhum',rhum0_bckp,bsd,bed)

					if len(rh_ret) > 0: rh_list[ob]=rh_ret[0]

		rh = rh_list[ob]

		if precip_miss[ob] == miss:

			try:

				precip_list[ob] = prcp_forecasts[ob]

			except KeyError:

				pass

#			print stn,'Estimate of missing precip',bsd,precip_list[ob]

			if precip_list[ob] == miss:

				precip_list[ob] == 0.

#				precip_list[ob] = estmiss(precip_miss,ob)

#				if precip_list[ob] == miss:

#					if not prcp0_bckp: prcp0_bckp = initHourlyVar(backup,'prcp')

#					precip_ret,dts = getHourlyVars(backup,'prcp',prcp0_bckp,bsd,bed)

#					if len(precip_ret) > 0: precip_list[ob]=precip_ret[0]

		precip = precip_list[ob]

	

#		build derived lists

		wx = wx_list[ob]

		if temp == miss or dew == miss or precip == miss:

			leaf_wet = miss	

		elif wx <>  ['NONE'] or temp-dew < 3 or last_wet ==1 or precip <>0:

			leaf_wet = 1

		else:

			leaf_wet = 0

		if leaf_wet == miss or (wx == ['NONE'] and temp-dew >=3 and precip == 0):

			last_wet = 0

		else:

			last_wet = leaf_wet	



		if temp == miss:

			tempc_list.append(miss)

		else:

			tempc_list.append((5./9.)*(temp-32))

		if leaf_wet == miss:

			wet_list.append(miss)

		else:

			wet_list.append(leaf_wet)

	

#	release TSVars for backups, if used

	if temp0_bckp: 

		temp0_bckp.release()

		temp0_bckp = None

	if dwpt0_bckp: 

		dwpt0_bckp.release()

		dwpt0_bckp = None

	if rhum0_bckp: 

		rhum0_bckp.release()

		rhum0_bckp = None

	if prcp0_bckp: 

		prcp0_bckp.release()

		prcp0_bckp = None



#	calculate disease risk values for stations with good precipitation data

	if lldict[stn][3] == 0:

		risk, fx_risk, dly_risk = disease_calcs(begin_list,temp_list,precip_list,tempc_list,wet_list,rh_list,wx_list,start_date_dt,end_date_dt)		

#		write results to files

		if risk[0] != miss:

			anth_risk.write    ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],risk[0]))

		if risk[1] != miss:

			pblight_risk.write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],risk[1]))

		if risk[2] != miss:

			bpatch_risk.write  ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],risk[2]))

		if risk[3] != miss:

			dspot_risk.write   ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],risk[3]))

		if fx_risk[0] != miss:

			anth_fcst_risk.write    ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],fx_risk[0]))

		if fx_risk[1] != miss:

			pblight_fcst_risk.write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],fx_risk[1]))

		if fx_risk[2] != miss:

			bpatch_fcst_risk.write  ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],fx_risk[2]))

		if fx_risk[3] != miss:

			dspot_fcst_risk.write   ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],fx_risk[3]))

		for i in range(1,7):

			if dly_risk[i-1][0] != miss:

				anthr_fx_day[i].write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],dly_risk[i-1][0]))

			if dly_risk[i-1][1] != miss:

				pblit_fx_day[i].write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],dly_risk[i-1][1]))

			if dly_risk[i-1][2] != miss:

				bptch_fx_day[i].write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],dly_risk[i-1][2]))

			if dly_risk[i-1][3] != miss:

				dspot_fx_day[i].write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'% (stn,lldict[stn][1],lldict[stn][2],dly_risk[i-1][3]))

	

#	now do heat stress for all stations

	hs_end_dt = end_date_dt + DateTime.RelativeDate(hour=8)

	hs_start_dt = hs_end_dt + DateTime.RelativeDate(hours=-300)

	hs_short_start = [hs_start_dt.year,hs_start_dt.month,hs_start_dt.day,hs_start_dt.hour]

	try:

		start_index = dates['temp'].index(hs_short_start)

		hs_risk, fx_hs_risk, hs_dly_risk = hstress_calcs(temp_list[start_index:],rh_list[start_index:],hs_start_dt,hs_end_dt)

#		write results to files

		if hs_risk != miss: 

			hs_file.write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'%(stn,lldict[stn][1],lldict[stn][2],hs_risk))

		else:

			print 'Heat stress not calculated for:',stn

		if fx_hs_risk != miss:

			hs_fcst_file.write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'%(stn,lldict[stn][1],lldict[stn][2],fx_hs_risk))

		for i in range(1,7):

			if hs_dly_risk[i-1] != miss:

				hs_fx_day[i].write ('%4s\t%6.2f\t%6.2f\t%4.1f\n'%(stn,lldict[stn][1],lldict[stn][2],hs_dly_risk[i-1]))

	except:	

		print_exception()

		print "Error in heat stress section"



forecast_db.close()

# update dates in mapping control files

#updateControlFiles(request_dt)

		
