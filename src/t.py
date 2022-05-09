#! /usr/bin/env python

import sys
from datetime import datetime
from mx import DateTime
from print_exception import print_exception
from hourlyDataRoutines import *
from stn_list_ll import stn_list
import art_stat
from precip_amt_forecast import *

output_directory = "/Users/kle1/BaseMapper/DiseaseMaps/"
miss = -999
            
def get_input():
	if len(sys.argv) == 2:
		mdy = (sys.argv[1].strip()).replace("-",",").split(",")
		for i in range(len(mdy)):
			mdy[i] = int(mdy[i])
		end_date_dt = DateTime.DateTime(mdy[0],mdy[1],mdy[2])
	else:
	#	default end today
		end_date_dt = DateTime.now()
	return end_date_dt

def write_dateline (ctrlfil,start_date_dt,end_date_dt):
	if start_date_dt == end_date_dt:
		dateline = "%s,%s,%s" % (start_date_dt.year,start_date_dt.month,start_date_dt.day)
	else:
		dateline = "%s,%s,%s\t%s,%s,%s" % (start_date_dt.year,start_date_dt.month,start_date_dt.day,\
					end_date_dt.year,end_date_dt.month,end_date_dt.day)
	ctrlfil.write("%s\n" % dateline)

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

def disease_calcs(begin_list,temp_list,precip_list,tempc_list,wet_list,rh_list,wx_list,start_date_dt,end_date_dt,stn):
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

		dollar_rh_daily = [0,0,0]	#initialization should be improved		#fixing dollar_rh bug 9/8/2016
		cons_rain = [0,0,0]			#initialization should be improved

		switch_date = DateTime.DateTime(end_date_dt.year,07,01)
		switch_date2 = DateTime.DateTime(end_date_dt.year,9,30)

#		2/2010 - changed end of loop from len(begin_list)-1 to len(begin_list) - kle
		for day in range (3,len(begin_list)):
			wet_count = 0
			wet_count1 = 0
			rh_89 = 0
			rh_95 = 0
			rain_cnt = 0
##			dollar_rh = 0					# moved from outside loop -kle 2/23/2010

			avg_t = art_stat.avger(tempc_list[begin_list[day-3]:begin_list[day]])     #  3-day temp average
	  
			for val in range(begin_list[day-3],begin_list[day]):
				if wet_list[val] == miss or wet_count == miss:
					print 'missing wet_list value',val,wet_list[val]
					wet_count = miss
				else:
					wet_count = wet_count + wet_list[val]								  #  3-day total wetness hours
			for val in range(begin_list[day-1],begin_list[day]):
				if wet_list[val] == miss or wet_count1 == miss:
					wet_count1 = miss
				else:
					wet_count1 = wet_count1 + wet_list[val]

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
					if rh_list[val] > 89 and rh_89 != miss: rh_89 = rh_89 +1
					if rh_list[val] > 95 and rh_95 != miss: rh_95 = rh_95 +1

				rain = -1
				driz = -1
#				for wx in range(len(wx_list[val])):
#					if wx_list[val][wx].find('RA')<>-1:rain = 1
#					if wx_list[val][wx].find('DZ')<>-1:driz = 1

				if rain <>-1 or precip_list[val] <> 0 or driz <>-1:
					rain_cnt = rain_cnt + 1

			min_t = min(temp_list[begin_list[day-1]:begin_list[day]])
			max_t = max(temp_list[begin_list[day-1]:begin_list[day]])

			#pblight calculation
			if max_t != miss and min_t != miss and rh_89 != miss:
				pblight_index = (max_t - 86) + (min_t-68) + 0.5*(rh_89-6)
			else:
				pblight_index = miss

			if rh_95 == miss:
				rh95_bp = miss 
			elif rh_95 >=8: 
				rh95_bp = 2
			elif rh_95 > 4:
				rh95_bp = 1
			else:
				rh95_bp = 0

			avg_rh = art_stat.avger(rh_list[begin_list[day-1]:begin_list[day]])
			if avg_rh == miss:     
				rhavg_bp = miss	   
			elif avg_rh >=80:      
				rhavg_bp = 1
			else:
				rhavg_bp = 0

			if wet_count1 == miss:
				leaf_bp = miss	   
			elif wet_count1 > 10:  
				leaf_bp = 1
			else:
				leaf_bp = 0

			min_tc = min(tempc_list[begin_list[day-1]:begin_list[day]])
			if min_tc == miss:  
				mint_bp = miss  
			elif min_tc >= 16:  
				mint_bp = 1
			elif (start_date_dt + DateTime.RelativeDate(days=+day)) < switch_date:
				mint_bp = -4
			elif (start_date_dt + DateTime.RelativeDate(days=+day)) > switch_date2:
				mint_bp = -4
			else:
				mint_bp = -2

			#bpatch calculation
			if rh95_bp != miss and rhavg_bp != miss and leaf_bp != miss and mint_bp != miss:
				bpatch = rh95_bp + rhavg_bp + leaf_bp + mint_bp
			else:
				bpatch = miss

			avg_t1 = art_stat.avger(tempc_list[begin_list[day-1]:begin_list[day]])
			max_rh = max(rh_list[begin_list[day-1]:begin_list[day]])
			cons_rain.append(rain_cnt)

			rain_row = 0
			if day>=5:
				for lday in range (0,6):
					if cons_rain[day-lday]<>0:
						rain_row=rain_row+1
					else:
						break 

			if rain_row<>0:
				avg_t2 = art_stat.avger(tempc_list[begin_list[day-rain_row]:begin_list[day]])
			else:
				avg_t2 = 0

			if max_rh > 90 and avg_t1 > 25:
				dollar_rh_daily.append(1)
			else:
				dollar_rh_daily.append(0)

			dollar_rh = 0
			for lday in range (0,7):
				if day-lday >= 0:
					dollar_rh += dollar_rh_daily[day-lday]

			#dspot calculation
			if max_rh != miss and wet_count != miss and avg_t1 != miss and avg_t2 != miss and rain_row != miss:
##				if max_rh > 90 and avg_t1 > 25: dollar_rh = dollar_rh + 1
				if dollar_rh >=3:
					dspot1 = 1   #dollar_rh
				else:
					dspot1 = 0

				if wet_count > 8 and avg_t1 > 15:		# changed threshold from 14 to 8 - 9/8/2016 kle
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

# setup dates
request_dt = get_input()
start_date_dt = request_dt + DateTime.RelativeDate(days=-9)
# 2/2010 - changed from hours=-1 to hour=7
start_date_dt=start_date_dt+DateTime.RelativeDate(hour=7)
short_start = "%d-%02d-%02d" % (start_date_dt.year,start_date_dt.month,start_date_dt.day)
end_date_dt = start_date_dt + DateTime.RelativeDate(hours=+362)  #15 days plus 2 hours (for heat stress forecasts)
short_end = "%d-%02d-%02d" % (end_date_dt.year,end_date_dt.month,end_date_dt.day)

# get latitude and longitude for each station
lldict = {}
for stn,backup,backup2,daily_ppt,lat,lon in stn_list:
	lldict[stn] = [backup, lat, lon, daily_ppt]

# open all mapping output files
anth_risk    = open('%santhr_map_out.txt'%output_directory,'w')
pblight_risk = open('%spblit_map_out.txt'%output_directory,'w')
bpatch_risk  = open('%sbptch_map_out.txt'%output_directory,'w')
dspot_risk   = open('%sdspot_map_out.txt'%output_directory,'w')
hs_file      = open('%shstress_map_out.txt'%output_directory,'w')
anth_fcst_risk    = open('%santhr_fcst_map_out.txt'%output_directory,'w')
pblight_fcst_risk = open('%spblit_fcst_map_out.txt'%output_directory,'w')
bpatch_fcst_risk  = open('%sbptch_fcst_map_out.txt'%output_directory,'w')
dspot_fcst_risk   = open('%sdspot_fcst_map_out.txt'%output_directory,'w')
hs_fcst_file      = open('%shs_fcst_map_out.txt'%output_directory,'w')
hs_fx_day = {}
anthr_fx_day = {}
pblit_fx_day = {}
bptch_fx_day = {}
dspot_fx_day = {}
for i in range(1,7):
	hs_fx_day[i] = open('%shs_fcstd%s_map_out.txt'%(output_directory,i),'w')
	anthr_fx_day[i] = open('%santhr_fcstd%s_map_out.txt'%(output_directory,i),'w')
	pblit_fx_day[i] = open('%spblit_fcstd%s_map_out.txt'%(output_directory,i),'w')
	bptch_fx_day[i] = open('%sbptch_fcstd%s_map_out.txt'%(output_directory,i),'w')
	dspot_fx_day[i] = open('%sdspot_fcstd%s_map_out.txt'%(output_directory,i),'w')

# write the date range in the first line of each output file
for infile in [anth_risk,pblight_risk,bpatch_risk,dspot_risk,hs_file]:
	write_dateline (infile, request_dt + DateTime.RelativeDate(days=-6), request_dt)
fx_start_date_dt = request_dt + DateTime.RelativeDate(days=+1)
fx_end_date_dt = request_dt + DateTime.RelativeDate(days=+6)
for infile in [anth_fcst_risk, pblight_fcst_risk, bpatch_fcst_risk, dspot_fcst_risk, hs_fcst_file]:
	write_dateline (infile, fx_start_date_dt, fx_end_date_dt)
theDate = fx_start_date_dt
for i in range(1,7):
	write_dateline(hs_fx_day[i], theDate, theDate)
	write_dateline(anthr_fx_day[i], theDate, theDate)
	write_dateline(pblit_fx_day[i], theDate, theDate)
	write_dateline(bptch_fx_day[i], theDate, theDate)
	write_dateline(dspot_fx_day[i], theDate, theDate)
	theDate = theDate + DateTime.RelativeDate(days=+1)
	
begin_list = []

for stn in lldict.keys():
###for stn in ['KSYR']:
###	print stn
	backup = lldict[stn][0]
	id_type = "icao"
	values = {}
	dates = {}
	temp_list = []
	precip_list=[]
	dew_list = []
	wx_list = []
	tempc_list = []
	wet_list = []
	rh_list = []

#	get hourly data
	varlist = ['temp','dwpt','rhum']
	if lldict[stn][3] == 0:
		varlist.append('prcp')
	data_dict, key_dates = getDataForVars(varlist, stn, id_type, start_date_dt, end_date_dt)
	if not data_dict:
		print 'No data returned for:',stn
		continue
	if data_dict.has_key('temp'): tempdata = data_dict['temp']
	if data_dict.has_key('prcp'): prcpdata = data_dict['prcp']
	if data_dict.has_key('rhum'): rhumdata = data_dict['rhum']
	if data_dict.has_key('dwpt'): dwptdata = data_dict['dwpt']
	
#	process data hourly, first filling in missing values as much as possible
	try:
#		dictionary with saved results for backup station and forecasts (to be used in estimation)
		temp_bckupDict = None
		prcp_bckupDict = None
		rhum_bckupDict = None
		dwpt_bckupDict = None
		temp_fcstDict = None
		prcp_fcstDict = None
		pop12_fcstDict = None
		rhum_fcstDict = None
		dwpt_fcstDict = None
		last_wet = 0

#		fill in missing values as much as possible
		for hindx in range(0, len(key_dates)):
			theDate = key_dates[hindx]
			if tempdata[hindx] == miss:
				tempval = estmiss(tempdata,hindx)
				if tempval == miss:
					tempval, temp_fcstDict = forecast_est(stn,id_type,'temp',key_dates[hindx],temp_fcstDict,start_date_dt, end_date_dt)
					if tempval == miss:
						tempval, temp_bckupDict = backup_est(backup,'icao','temp',key_dates[hindx],temp_bckupDict,start_date_dt,end_date_dt)
						if tempval == miss:
							tempval = miss
							if theDate <= end_date_dt: print stn,'No temp replacement value for',key_dates[hindx]
			else:
				tempval = tempdata[hindx]
			if rhumdata[hindx] == miss:
				rhumval = estmiss(rhumdata,hindx)
				if rhumval == miss:
					rhumval, rhum_fcstDict = forecast_est(stn,id_type,'rhum',key_dates[hindx],rhum_fcstDict,start_date_dt,end_date_dt)
					if rhumval == miss:
						rhumval, rhum_bckupDict = backup_est(backup,'icao','rhum',key_dates[hindx],rhum_bckupDict,start_date_dt,end_date_dt)
						if rhumval == miss:
							rhumval = miss
							if theDate <= end_date_dt: print stn,'No rhum replacement value for',key_dates[hindx]
			else:
				rhumval = rhumdata[hindx]
			if 'prcp' in varlist:
				if prcpdata[hindx] == miss:
					prcpval, prcp_bckupDict = backup_est(backup,'icao','prcp',key_dates[hindx],prcp_bckupDict,start_date_dt,end_date_dt)
					if prcpval == miss:
						prcpval, prcp_fcstDict = forecast_qpfest(stn,id_type,'qpf',key_dates[hindx],prcp_fcstDict,start_date_dt,end_date_dt)
						if prcpval == miss:
							prcpval, pop12_fcstDict = forecast_pop12est(stn,id_type,'pop12',key_dates[hindx],pop12_fcstDict,start_date_dt,end_date_dt)
							if prcpval == miss:
								prcpval = 0.00
								if theDate <= end_date_dt: print stn,'No prcp replacement value for',key_dates[hindx],'; set to zero'
				else:
					prcpval = prcpdata[hindx]
			if dwptdata[hindx] == miss:
				dwptval = estmiss(dwptdata,hindx)
				if dwptval == miss:
					dwptval, dwpt_fcstDict = forecast_est(stn,id_type,'dwpt',key_dates[hindx],dwpt_fcstDict,start_date_dt, end_date_dt)
					if dwptval == miss:
						dwptval, dwpt_bckupDict = backup_est(backup,'icao','dwpt',key_dates[hindx],dwpt_bckupDict,start_date_dt,end_date_dt)
						if dwptval == miss:
							dwptval = miss
							if theDate <= end_date_dt: print stn,'No dwpt replacement value for',key_dates[hindx]
			else:
				dwptval = dwptdata[hindx]

#			convert from character to integer/float
			temp = int(round(tempval,0))
			rh = int(round(rhumval,0))
			precip = round(prcpval,2)
			dew = int(round(dwptval,0))
#			add hourly values to lists
			temp_list.append(temp)
			rh_list.append(rh)
			precip_list.append(precip)
			dew_list.append(dew)

#			build derived lists
			if temp == miss or dew == miss or precip == miss:
				leaf_wet = miss
			elif temp-dew < 3 or last_wet == 1 or precip <> 0:
				leaf_wet = 1
			else:
				leaf_wet = 0
			wet_list.append(leaf_wet)

			if temp == miss:
				tempc_list.append(miss)
			else:
				tempc_list.append((5./9.)*(temp-32))

			if leaf_wet == miss or (temp-dew >= 3 and precip == 0):
				last_wet = 0
			else:
				last_wet = leaf_wet
			
	except:
		print_exception()
		print 'Error with data; skipping station %s...'%stn
		continue
		
	if len(begin_list) == 0:
		lastGoodDataIndx = len(key_dates)-1
		while temp_list[lastGoodDataIndx] == miss:
			lastGoodDataIndx -= 1

		list_index = 0
		for theDate in key_dates[:lastGoodDataIndx+1]:
			if theDate.hour == 6 and theDate >= start_date_dt and theDate <= end_date_dt:
				begin_list.append(list_index)
			list_index = list_index + 1
		begin_list.append(lastGoodDataIndx+1)
	
#	calculate disease risk values for stations with good precipitation data
	if lldict[stn][3] == 0:
		risk, fx_risk, dly_risk = disease_calcs(begin_list,temp_list,precip_list,tempc_list,wet_list,rh_list,wx_list,start_date_dt,end_date_dt,stn)
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

	try:
#		now do heat stress for all stations
		hs_end_dt = end_date_dt + DateTime.RelativeDate(hour=8)
		hs_start_dt = hs_end_dt + DateTime.RelativeDate(hours=-300)
		hs_start_srch = datetime(hs_start_dt.year,hs_start_dt.month,hs_start_dt.day,hs_start_dt.hour)
		start_index = key_dates.index(hs_start_srch)
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