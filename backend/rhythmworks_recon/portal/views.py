from django.shortcuts import render,get_object_or_404
from rest_framework import viewsets,status,generics,permissions
from .models import *
from .serializers import *
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.schemas import views
from rest_framework.response import Response
from url_filter.integrations.drf import DjangoFilterBackend
from rest_framework.views import APIView
from copy import error
import json
import itertools

from django.db.models.fields import BooleanField
from rest_framework.fields import empty
from sqlalchemy import create_engine,Column, Integer, Float, String, Boolean,Table
engine = create_engine('postgresql://rhythmfl_bankrecon_dev:Rhythmflows@2020@85.187.133.83:5432/rhythmfl_bankrecondev', echo=True)
# engine = create_engine('sqlite:///db.sqlite3', echo=True)
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

from django.db import connection, models
from django.db.models import query
from django.http import HttpResponse, request
from django.http.response import JsonResponse
from rest_framework.decorators import api_view
import django.apps
from django.contrib import admin
from django.core.management import sql, color

from rest_framework.parsers import JSONParser

# Create your views here.
class TermViewSet(viewsets.ModelViewSet):
    serializer_class = TermSerializer
    queryset = tbl_term_mst.objects.filter(is_deleted='N')

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    queryset = tbl_company_mst.objects.filter(is_deleted='N')

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()

class CountryViewSet(viewsets.ModelViewSet):
    queryset = Tbl_Country_Mst.objects.filter(is_deleted='N')
    serializer_class = CountrySerializer        
 
class StateViewSet(viewsets.ModelViewSet):
    serializer_class = StateSerializer
    queryset = Tbl_State_Mst.objects.filter(is_deleted='N')

class CityViewSet(viewsets.ModelViewSet):
    serializer_class = CitySerializer
    queryset = Tbl_City_Mst.objects.filter(is_deleted='N')

class LocationViewSet(viewsets.ModelViewSet):
    serializer_class = LocationSerializer
    queryset = tbl_location_mst.objects.all().filter(is_deleted='N')

    def delete(self):
        self.queryset = tbl_location_mst.objects.filter(self=self).update(is_deleted='Y')

class tbl_reason_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_reason_mst_serializers
    queryset = tbl_reason_mst.objects.all().filter(is_deleted='N')

    def delete(self):
        self.queryset = tbl_reason_mst.objects.filter(self=self).update(is_deleted='Y')

class tbl_sourcetable_fields_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_sourcetable_fields_mst_serializers
    queryset = tbl_sourcetable_fields_mst.objects.filter(is_deleted='N')

class UOMViewSet(viewsets.ModelViewSet):
    queryset = Tbl_Uom_Mst.objects.filter(is_deleted='N')
    serializer_class = UOMSerializer

    def delete(self):
        self.queryset = Tbl_Uom_Mst.objects.filter(self=self).update(is_deleted='Y')

class MasterViewSet(viewsets.ModelViewSet):
    serializer_class = MasterSerializer
    queryset = tbl_master.objects.filter(is_deleted='N')

    def list(self, request, master_type=None):
        if master_type:
            master = tbl_master.objects.filter(master_type = master_type, is_deleted='N')
            serializer = self.get_serializer(master, many=True)
            return Response(serializer.data)
        else:
            currency = tbl_master.objects.filter(is_deleted='N')
            serializer = self.get_serializer(currency, many=True)
            return Response(serializer.data)

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Tbl_Currency_Mst.objects.filter(is_deleted='N')
    serializer_class = CurrencySerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['currency_code','is_deleted']

    def list(self, request, country_id=None):
        if country_id:
            currency = Tbl_Currency_Mst.objects.filter(country_id = country_id, is_deleted='N')
            serializer = self.get_serializer(currency, many=True)
            return Response(serializer.data)
        else:
            currency = Tbl_Currency_Mst.objects.filter(is_deleted='N')
            serializer = self.get_serializer(currency, many=True)
            return Response(serializer.data)

class ChannelViewset(viewsets.ModelViewSet):
    queryset = tbl_channel_mst.objects.all()
    serializer_class = ChannelSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['company_id']

# class CurrencyViewSet(generics.ListAPIView):
#     queryset = Tbl_Currency_Mst.objects.filter(is_deleted='N')
#     serializer_class = CurrencySerializer
#     filter_backends = [DjangoFilterBackend]
#     filter_fields = ['currency_code','is_deleted']

#     def get_queryset(self):
#         country_id = self.kwargs['country_id']
#         return Tbl_Currency_Mst.objects.filter(is_deleted='N', country_id=country_id)         

class tbl_source_mst_view(viewsets.ModelViewSet):
    queryset = tbl_source_mst.objects.filter(is_deleted='N')
    serializer_class = tbl_source_mst_serializer

class tbl_source_details_view(viewsets.ModelViewSet):
    queryset = tbl_source_details.objects.filter(is_deleted='N')
    serializer_class = tbl_source_details_serializer

    def retrieve(self, request, *args, **kwargs):
        header_ref_id = self.kwargs['pk']
        source_details = tbl_source_details.objects.filter(
            header_ref_id=header_ref_id, is_deleted='N')
        ser = tbl_source_details_serializer(source_details, many=True).data
        return Response(ser, status=status.HTTP_200_OK)

class LeftPanelViewSet(viewsets.ModelViewSet):
    queryset = tbl_left_panel.objects.filter(is_deleted='N')
    serializer_class = tbl_left_panel_serializer

class AssignPagesRolesViewSet(viewsets.ModelViewSet):
    queryset = tbl_assign_pages_roles.objects.filter(is_deleted='N')
    serializer_class = tbl_assign_pages_roles_serializer

@csrf_exempt
def dynamic_table1(request):
    if request.method == "POST":
        tables = json.loads(request.body)
        # create table tbl_visa_src(id var,name varchar(20))
        for data in tables:
            query = "create table "
            count = 0
            select = "Select * from "
            for d in data:
                # name of table
                if 'name' in d:
                    print(d['name']);
                
                    query += d['name']+"("
                    select += d['name']
                else:
                    schema = d['schema']
                    for s in schema:
                        if count != 0:
                            query += ","+s['field']+" "+s['type']
                            if s['primary_key'] == "Yes":
                                query += " PRIMARY KEY"
                        else:
                            query += s['field']+" "+s['type']
                            if s['primary_key'] == "Yes":
                                query += " PRIMARY KEY"
                        count += 1
            query += ');'
            cursor = connection.cursor()
            cursor.execute(query)
            print("Query=>", query)
            cursor.execute(select)
            row = cursor.fetchone()
            print("Data=>", row)

        print()

        return JsonResponse({"Success": True})
    elif request.method == "GET":
        print("BYE")
        return JsonResponse({"Success": True})


# ORM dynamic Table
def create_model(name, fields=None, app_label='', module='', options=None, admin_opts=None):
    """
    Create specified model
    """
    class Meta:
        # Using type('Meta', ...) gives a dictproxy error during model creation
        pass

    if app_label:
        # app_label must be set using the Meta inner class
        setattr(Meta, 'app_label', app_label)

    # Update Meta with any options that were provided
    if options is not None:
        for key, value in options.items():
            setattr(Meta, key, value)

    # Set up a dictionary to simulate declarations within a class
    attrs = {'__module__': module, 'Meta': Meta}

    # Add in any fields that were provided
    if fields:
        attrs.update(fields)

    # Create the class, which automatically triggers ModelBase processing
    model = type(name, (models.Model,), attrs)

    # Create an Admin class if admin options were provided
    if admin_opts is  None:
        class Admin(admin.ModelAdmin):
            pass
        # for key, value in admin_opts:
        #     setattr(Admin, key, value)
        admin.site.register(model, Admin)

    return model


def dynamic_table12(request):
    fields = {
        'first_name': models.CharField(max_length=255),
        'last_name': models.CharField(max_length=255),
    }
    options = {
        'ordering': ['last_name', 'first_name'],
        'verbose_name': 'valued customer',
    }
    admin_opts = {}
    model = create_model('Student', fields,
                         options=options, admin_opts=admin_opts,
                         app_label='portal',
                         module='portal.models',
                         )
    style = color.no_style()
    statements, pending = sql.sql_model_create(model, style)
    cursor = connection.cursor()

    # for s in statements:
    #     cursor.execute(s)
    
    # with connection.schema_editor() as editor:
    #     editor.create_model(model)
    print("MODEL ", model)
    print("TBL ->", tbl_source_mst.__module__)
    print("TBL MODULE ->", tbl_source_details._meta.app_label)
    print("MODEL MODULE-> ", model.__module__)
    print("APP Label - >", model._meta.app_label)
    print("Length->", len(model._meta.fields))
    print("VERBOSE->", model._meta.verbose_name_plural)
    mylist = (django.apps.apps.get_models())
    for m in mylist:
        print(m)
    return HttpResponse("OK APP created")

# Function to create the dynamic table
def sql_format(data):
    print("Data = > ",data)
    class User(Base):
        __tablename__ = data['table_name']
        Flag=False

        # pk_id = Column(Integer, primary_key=True)
        schema = data['schema']

        for s in schema:
            # print(s['field_data_type'],"=>",s['field_name'])
            if s['field_data_type']=='1':
                print("1")
                if s['is_primary_key']:
                    Flag=True
                    vars()[s['field_name']] = Column(Integer(),primary_key=True)
                else:
                    # if s['is_key']:
                    #     vars()[s['field_name']] = Column(Integer(),unique=True)
                    # else:
                        vars()[s['field_name']] = Column(Integer())
            elif s['field_data_type']=='2':
                print("1")
                if s['is_primary_key']:
                    Flag=True
                    vars()[s['field_name']] = Column(String(int(s['field_length'])),primary_key=True)
                else:
                    if s['is_key']:
                        vars()[s['field_name']] = Column(String(int(s['field_length'])),unique=True)
                    else:
                        vars()[s['field_name']] = Column(String(int(s['field_length'])))
            elif s['field_data_type']=='3':
                vars()[s['field_name']] = Column(Boolean)
            elif s['field_data_type']=='4':
                if s['is_primary_key']:
                    Flag=True
                    vars()[s['field_name']] = Column(Float(precision=4),primary_key=True)
                else:
                    if s['is_key']:
                        vars()[s['field_name']] = Column(Float(precision=4),unique=True)
                    else:
                        vars()[s['field_name']] = Column(Float(precision=4))
        if not Flag:
            id = Column(Integer, primary_key=True)

            # for i in list(data['schema']):
            #     if dict[i] == 'Float':
            #         vars()[i] = Column(Float)
            #     if dict[i] == 'String':
            #         vars()[i] = Column(String)
            #     if dict[i] == 'Date':
            #         vars()[i] = Column(Date)
    Base.metadata.create_all(engine)

@csrf_exempt
def dynamic_table(request):
    if request.method == "POST":
        # Convert the data into json
        tables = json.loads(request.body)
        for data in tables:
            schema=data['schema']
            for s in schema:
                # Get the object of field_data_type from tbl_master and assign its master_value
                mst_object = tbl_master.objects.get(id=s['field_data_type'])
                s['field_data_type']=mst_object.master_value
                # print("TYPES = > ",s['field_data_type'])
            
            # Check whether data is empty or not
            if data:
                print("Data = > >",json.dumps(data, indent = 4) )
                sql_format(data)
            
        print("Tables=>",tables)
        return JsonResponse({"Success":True})

class tbl_reconcilation_definition_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_reconcilation_definition_mst_serializer
    queryset = tbl_reconcilation_definition_mst.objects.filter(is_deleted='N')

class tbl_reconcilation_definition_details_view(viewsets.ModelViewSet):
    serializer_class = tbl_reconcilation_definition_details_serializer
    queryset = tbl_reconcilation_definition_details.objects.filter(is_deleted='N')

class tbl_api_definition_details_view(viewsets.ModelViewSet):
    serializer_class = tbl_api_definition_details_serializer
    queryset = tbl_api_definition_details.objects.filter(is_deleted='N')

class tbl_api_definition_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_api_definition_mst_serializer
    queryset = tbl_api_definition_mst.objects.filter(is_deleted='N')

class tbl_api_definition_standard_details_view(viewsets.ModelViewSet):
    serializer_class = tbl_api_definition_standard_details_serializer
    queryset = tbl_api_definition_standard_details.objects.filter(is_deleted='N')

class tbl_api_definition_standard_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_api_definition_standard_mst_serializer
    queryset = tbl_api_definition_standard_mst.objects.filter(is_deleted='N')    

# reconciliation process
class tbl_reconcilation_process_details_view(viewsets.ModelViewSet):
    serializer_class = tbl_reconcilation_process_details_serializer
    queryset = tbl_reconcilation_process_details.objects.filter(is_deleted='N')

@csrf_exempt
def run_reconciliation(request):
    if request.method == "POST":
        # Convert the data into json
        data = json.loads(request.body)
        recon_id=int(data[0]['reconcilation_ref_id'])
        con = engine.connect()
        recon_type = con.execute("""select master_key from portal_tbl_master where id in
                                    (SELECT recon_type_ref_id_id FROM public.portal_tbl_reconcilation_definition_mst
                                    where id=""" + str(recon_id) + """ and is_deleted= 'N')
                                    and is_deleted= 'N'
                                    """)
        source_details = con.execute("""SELECT source_name1_ref_id_id, source_name2_ref_id_id, source_name3_ref_id_id,
                                    source_name4_ref_id_id, recon_rule, probable_match_rule, is_deleted, recon_type_ref_id_id
                                    FROM public.portal_tbl_reconcilation_definition_mst
                                    where id = """ + str(recon_id)
                                    )
        recon_type = list(recon_type)
        source_details = list(source_details)

        print(source_details, recon_type)

        ################################################### TWO WAY ####################################################################

        if source_details[0][0] and source_details[0][1] and not source_details[0][2] and not source_details[0][3] and recon_type[0][0] == 'Two-way':
            source_names = []*2
            for i in range(2):
                source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
                source_name_query = list(source_name_query)
                source_names.append(source_name_query[0][0])

            source1_name = 'tbl_' + source_names[0] + '_details'
            source2_name = 'tbl_' + source_names[1] + '_details'

            source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
            source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'

            source_list = [source1_name, source2_name]
            source_dispute_list = [source1_dispute_name, source2_dispute_name]

            recon_rule = source_details[0][4]
            probable_match_rule = source_details[0][5]

        ###################################################### RECON RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {} WHERE {};""".format(
                source1_name,
                source2_name,
                recon_rule
            )
            con.execute(update_query)
            print(update_query)
            
            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {} WHERE {};""".format(
                source2_name,
                source1_name,
                recon_rule
            )
            con.execute(update_query)
            print(update_query)

            ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {} WHERE {};""".format(
                source1_name,
                source2_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {} WHERE {};""".format(
                source2_name,
                source1_name,
                probable_match_rule
            )
            con.execute(update_query)

            ######################################### DISPUTE 2 WAY #########################################################

            from sqlalchemy.orm import sessionmaker
            Session = sessionmaker(bind=engine)
            Session.configure(bind=engine) 
            session = Session()

            for i in range(len(source_list)):

                class Tbl_details(Base):
                    __table__ = Table(source_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                class Tbl_dispute_details(Base):
                    __table__ = Table(source_dispute_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                tbl_details = Tbl_details()

                rows = session.query(Tbl_details).all()

                for each_row in rows:
                    tbl_details_dict = each_row.__dict__
                    for key in tbl_details_dict.copy():
                        if key == '_sa_instance_state':
                            del tbl_details_dict[key]
                    tbl_details_dict['action'] = 'Not Initiated'
                    if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
                        tbl_dispute_details = Tbl_dispute_details()
                        tbl_dispute_details.__dict__.update(tbl_details_dict)
                        session.add(tbl_dispute_details)

                session.commit()

        ################################################### THREE WAY ####################################################################

        if source_details[0][0] and source_details[0][1] and source_details[0][2] and not source_details[0][3] and recon_type[0][0] == 'Three-way':
            source_names = []*3
            for i in range(3):
                source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
                source_name_query = list(source_name_query)
                source_names.append(source_name_query[0][0])

            source1_name = 'tbl_' + source_names[0] + '_details'
            source2_name = 'tbl_' + source_names[1] + '_details'
            source3_name = 'tbl_' + source_names[2] + '_details'

            source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
            source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'
            source3_dispute_name = 'tbl_' + source_names[2] + '_dispute_details'

            source_list = [source1_name, source2_name, source3_name]
            source_dispute_list = [source1_dispute_name, source2_dispute_name, source3_dispute_name]

            recon_rule = source_details[0][4]
            probable_match_rule = source_details[0][5]

        ###################################################### RECON RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source1_name,
                source2_name,
                source3_name,
                recon_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source2_name,
                source1_name,
                source3_name,
                recon_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source3_name,
                source1_name,
                source2_name,
                recon_rule
            )
            con.execute(update_query)

            ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source1_name,
                source2_name,
                source3_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source2_name,
                source1_name,
                source3_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
                source3_name,
                source1_name,
                source2_name,
                probable_match_rule
            )
            con.execute(update_query)

    ######################################### DISPUTE 3 WAY #########################################################

            from sqlalchemy.orm import sessionmaker
            Session = sessionmaker(bind=engine)
            Session.configure(bind=engine) 
            session = Session()

            for i in range(len(source_list)):

                class Tbl_details(Base):
                    __table__ = Table(source_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                class Tbl_dispute_details(Base):
                    __table__ = Table(source_dispute_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                tbl_details = Tbl_details()

                rows = session.query(Tbl_details).all()

                for each_row in rows:
                    tbl_details_dict = each_row.__dict__
                    for key in tbl_details_dict.copy():
                        if key == '_sa_instance_state':
                            del tbl_details_dict[key]
                    tbl_details_dict['action'] = 'Not Initiated'
                    if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
                        tbl_dispute_details = Tbl_dispute_details()
                        tbl_dispute_details.__dict__.update(tbl_details_dict)
                        session.add(tbl_dispute_details)

                session.commit()

    ################################################### FOUR WAY ####################################################################

        if source_details[0][0] and source_details[0][1] and source_details[0][2] and source_details[0][3] and recon_type[0][0] == 'Four-way':
            source_names = []*4
            for i in range(4):
                source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
                source_name_query = list(source_name_query)
                source_names.append(source_name_query[0][0])

            source1_name = 'tbl_' + source_names[0] + '_details'
            source2_name = 'tbl_' + source_names[1] + '_details'
            source3_name = 'tbl_' + source_names[2] + '_details'
            source4_name = 'tbl_' + source_names[3] + '_details'

            source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
            source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'
            source3_dispute_name = 'tbl_' + source_names[2] + '_dispute_details'
            source4_dispute_name = 'tbl_' + source_names[3] + '_dispute_details'

            source_list = [source1_name, source2_name, source3_name, source4_name]
            source_dispute_list = [source1_dispute_name, source2_dispute_name, source3_dispute_name, source4_dispute_name]

            recon_rule = source_details[0][4]
            probable_match_rule = source_details[0][5]

            ###################################################### RECON RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source1_name,
                source2_name,
                source3_name,
                source4_name,
                recon_rule
            )
            con.execute(update_query)
            # print(update_query)

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source2_name,
                source1_name,
                source3_name,
                source4_name,
                recon_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source3_name,
                source1_name,
                source2_name,
                source4_name,
                recon_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source4_name,
                source1_name,
                source2_name,
                source3_name,
                recon_rule
            )
            con.execute(update_query)
            # print(update_query)

            recon_rule = [element.rstrip().replace('\n','').replace('\t','') for element in recon_rule.split('AND')]

            for i in range(len(source_list)):
                source_no = 1
                for j in range(len(source_list)):
                    if i != j:
                        # print(i+1, j+1, source_no, '\n')
                        actual_table = source_list[i]
                        specific_recon = source_list[j]

                        specific_rule = ""
                        for k in recon_rule:
                            if actual_table in k and specific_recon in k:
                                specific_rule += k + ' AND'

                        import re
                        update_query = """UPDATE {} SET "{}"='Reconciled' FROM {} WHERE {};""".format(
                                actual_table,
                                "recon_status_" + str(source_no),
                                specific_recon,
                                specific_rule[:-4]
                            )
                        source_no += 1


                        if update_query[-2] == ';':
                            update_query = update_query[:-1]
                        # print(update_query, '\n')
                        con.execute(update_query)

            ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source1_name,
                source2_name,
                source3_name,
                source4_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source2_name,
                source1_name,
                source3_name,
                source4_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source3_name,
                source1_name,
                source2_name,
                source4_name,
                probable_match_rule
            )
            con.execute(update_query)

            update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
                source4_name,
                source1_name,
                source2_name,
                source3_name,
                probable_match_rule
            )
            con.execute(update_query)
            # print(update_query)

            probable_match_rule = [element.rstrip().replace('\n','').replace('\t','') for element in probable_match_rule.split('AND')]

            for i in range(len(source_list)):
                source_no = 1
                for j in range(len(source_list)):
                    if i != j:
                        # print(i+1, j+1, source_no, '\n')
                        actual_table = source_list[i]
                        specific_probable = source_list[j]

                        specific_rule = ""
                        for k in probable_match_rule:
                            if actual_table in k and specific_probable in k:
                                specific_rule += k + ' AND'

                        import re
                        update_query = """UPDATE {} SET "{}"='Reconciled' FROM {} WHERE {};""".format(
                                actual_table,
                                "probable_recon_status_" + str(source_no),
                                specific_probable,
                                specific_rule[:-4]
                            )
                        source_no += 1


                        if update_query[-2] == ';':
                            update_query = update_query[:-1]
                        # print(update_query, '\n')
                        con.execute(update_query)

            ######################################### DISPUTE 4 WAY #########################################################

            from sqlalchemy.orm import sessionmaker
            Session = sessionmaker(bind=engine)
            Session.configure(bind=engine) 
            session = Session()

            for i in range(len(source_list)):

                class Tbl_details(Base):
                    __table__ = Table(source_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                class Tbl_dispute_details(Base):
                    __table__ = Table(source_dispute_list[i], Base.metadata,
                                    autoload=True, autoload_with=engine)

                tbl_details = Tbl_details()

                rows = session.query(Tbl_details).order_by(Tbl_details.details_id).all()

                auto_inc = 1
                for each_row in rows:
                    tbl_details_dict = each_row.__dict__
                    for key in tbl_details_dict.copy():
                        if key == '_sa_instance_state':
                            del tbl_details_dict[key]
                    tbl_details_dict['action'] = 'Not Initiated'
                    if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
                        for key in tbl_details_dict.copy():
                            if key == 'details_id':
                                details_ref_id = tbl_details_dict['details_id']
                                tbl_details_dict['details_ref_id'] = details_ref_id
                                tbl_details_dict['dispute_id'] = auto_inc
                                auto_inc += 1
                                del tbl_details_dict[key]
                        tbl_dispute_details = Tbl_dispute_details()
                        tbl_dispute_details.__dict__.update(tbl_details_dict)
                        session.add(tbl_dispute_details)
                session.commit()
                
    return JsonResponse({"Success":True})

# @csrf_exempt
# def run_reconciliation(request):
#     if request.method == "POST":
#         # Convert the data into json
#         data = json.loads(request.body)
#         print(data)
#         recon_id=int(data[0]['reconcilation_ref_id'])
#         con = engine.connect()
#         recon_type = con.execute("""select master_key from portal_tbl_master where id in
#                                     (SELECT recon_type_ref_id_id FROM public.portal_tbl_reconcilation_definition_mst
#                                     where id=""" + str(recon_id) + """ and is_deleted= 'N')
#                                     and is_deleted= 'N'
#                                     """)
#         source_details = con.execute("""SELECT source_name1_ref_id_id, source_name2_ref_id_id, source_name3_ref_id_id,
#                                     source_name4_ref_id_id, recon_rule, probable_match_rule, is_deleted, recon_type_ref_id_id
#                                     FROM public.portal_tbl_reconcilation_definition_mst
#                                     where id = """ + str(recon_id)
#                                     )
#         recon_type = list(recon_type)
#         source_details = list(source_details)

#         print(source_details, recon_type)

#         ################################################### TWO WAY ####################################################################

#         if source_details[0][0] and source_details[0][1] and not source_details[0][2] and not source_details[0][3] and recon_type[0][0] == 'Two-way':
#             source_names = []*2
#             for i in range(2):
#                 source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
#                 source_name_query = list(source_name_query)
#                 source_names.append(source_name_query[0][0])

#             source1_name = 'tbl_' + source_names[0] + '_details'
#             source2_name = 'tbl_' + source_names[1] + '_details'

#             source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
#             source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'

#             source_list = [source1_name, source2_name]
#             source_dispute_list = [source1_dispute_name, source2_dispute_name]

#             recon_rule = source_details[0][4]
#             probable_match_rule = source_details[0][5]

#         ###################################################### RECON RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 recon_rule
#             )
#             con.execute(update_query)
#             print(update_query)
            
#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 recon_rule
#             )
#             con.execute(update_query)
#             print(update_query)

#             ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             ######################################### DISPUTE 2 WAY #########################################################

#             from sqlalchemy.orm import sessionmaker
#             Session = sessionmaker(bind=engine)
#             Session.configure(bind=engine) 
#             session = Session()

#             for i in range(len(source_list)):

#                 class Tbl_details(Base):
#                     __table__ = Table(source_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 class Tbl_dispute_details(Base):
#                     __table__ = Table(source_dispute_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 tbl_details = Tbl_details()

#                 rows = session.query(Tbl_details).all()

#                 for each_row in rows:
#                     tbl_details_dict = each_row.__dict__
#                     for key in tbl_details_dict.copy():
#                         if key == '_sa_instance_state':
#                             del tbl_details_dict[key]
#                     tbl_details_dict['action'] = 'Not Initiated'
#                     if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
#                         tbl_dispute_details = Tbl_dispute_details()
#                         tbl_dispute_details.__dict__.update(tbl_details_dict)
#                         session.add(tbl_dispute_details)

#                 session.commit()

#         ################################################### THREE WAY ####################################################################

#         if source_details[0][0] and source_details[0][1] and source_details[0][2] and not source_details[0][3] and recon_type[0][0] == 'Three-way':
#             source_names = []*3
#             for i in range(3):
#                 source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
#                 source_name_query = list(source_name_query)
#                 source_names.append(source_name_query[0][0])

#             source1_name = 'tbl_' + source_names[0] + '_details'
#             source2_name = 'tbl_' + source_names[1] + '_details'
#             source3_name = 'tbl_' + source_names[2] + '_details'

#             source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
#             source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'
#             source3_dispute_name = 'tbl_' + source_names[2] + '_dispute_details'

#             source_list = [source1_name, source2_name, source3_name]
#             source_dispute_list = [source1_dispute_name, source2_dispute_name, source3_dispute_name]

#             recon_rule = source_details[0][4]
#             probable_match_rule = source_details[0][5]

#         ###################################################### RECON RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 source3_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source3_name,
#                 source1_name,
#                 source2_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 source3_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {} WHERE {};""".format(
#                 source3_name,
#                 source1_name,
#                 source2_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#     ######################################### DISPUTE 3 WAY #########################################################

#             from sqlalchemy.orm import sessionmaker
#             Session = sessionmaker(bind=engine)
#             Session.configure(bind=engine) 
#             session = Session()

#             for i in range(len(source_list)):

#                 class Tbl_details(Base):
#                     __table__ = Table(source_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 class Tbl_dispute_details(Base):
#                     __table__ = Table(source_dispute_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 tbl_details = Tbl_details()

#                 rows = session.query(Tbl_details).all()

#                 for each_row in rows:
#                     tbl_details_dict = each_row.__dict__
#                     for key in tbl_details_dict.copy():
#                         if key == '_sa_instance_state':
#                             del tbl_details_dict[key]
#                     tbl_details_dict['action'] = 'Not Initiated'
#                     if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
#                         tbl_dispute_details = Tbl_dispute_details()
#                         tbl_dispute_details.__dict__.update(tbl_details_dict)
#                         session.add(tbl_dispute_details)

#                 session.commit()

#     ################################################### FOUR WAY ####################################################################

#         if source_details[0][0] and source_details[0][1] and source_details[0][2] and source_details[0][3] and recon_type[0][0] == 'Four-way':
#             source_names = []*4
#             for i in range(4):
#                 source_name_query = con.execute("""SELECT source_name FROM public.portal_tbl_source_mst where id = """ + str(source_details[0][i]) + """;""")
#                 source_name_query = list(source_name_query)
#                 source_names.append(source_name_query[0][0])

#             source1_name = 'tbl_' + source_names[0] + '_details'
#             source2_name = 'tbl_' + source_names[1] + '_details'
#             source3_name = 'tbl_' + source_names[2] + '_details'
#             source4_name = 'tbl_' + source_names[3] + '_details'

#             source1_dispute_name = 'tbl_' + source_names[0] + '_dispute_details'
#             source2_dispute_name = 'tbl_' + source_names[1] + '_dispute_details'
#             source3_dispute_name = 'tbl_' + source_names[2] + '_dispute_details'
#             source4_dispute_name = 'tbl_' + source_names[3] + '_dispute_details'

#             source_list = [source1_name, source2_name, source3_name, source4_name]
#             source_dispute_list = [source1_dispute_name, source2_dispute_name, source3_dispute_name, source4_dispute_name]

#             recon_rule = source_details[0][4]
#             probable_match_rule = source_details[0][5]

#             ###################################################### RECON RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 source4_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 source3_name,
#                 source4_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source3_name,
#                 source1_name,
#                 source2_name,
#                 source4_name,
#                 recon_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_recon_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source4_name,
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 recon_rule
#             )
#             con.execute(update_query)
#             print(update_query)
#             ###################################################### PROBABLE MATCH RULE QUERYING ###############################################

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 source4_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source2_name,
#                 source1_name,
#                 source3_name,
#                 source4_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source3_name,
#                 source1_name,
#                 source2_name,
#                 source4_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)

#             update_query = """UPDATE {} SET "overall_probable_status"='Reconciled' FROM {}, {}, {} WHERE {};""".format(
#                 source4_name,
#                 source1_name,
#                 source2_name,
#                 source3_name,
#                 probable_match_rule
#             )
#             con.execute(update_query)
#             #print(update_query)

#             ######################################### DISPUTE 4 WAY #########################################################

#             from sqlalchemy.orm import sessionmaker
#             Session = sessionmaker(bind=engine)
#             Session.configure(bind=engine) 
#             session = Session()

#             for i in range(len(source_list)):

#                 class Tbl_details(Base):
#                     __table__ = Table(source_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 class Tbl_dispute_details(Base):
#                     __table__ = Table(source_dispute_list[i], Base.metadata,
#                                     autoload=True, autoload_with=engine)

#                 tbl_details = Tbl_details()

#                 rows = session.query(Tbl_details).all()

#                 auto_inc = 1
#                 for each_row in rows:
#                     tbl_details_dict = each_row.__dict__
#                     for key in tbl_details_dict.copy():
#                         if key == '_sa_instance_state':
#                             del tbl_details_dict[key]
#                     tbl_details_dict['action'] = 'Not Initiated'
#                     tbl_details_dict['dispute_id'] = auto_inc
#                     auto_inc += 1
#                     if tbl_details_dict['overall_recon_status'] == 'Not Reconciled':
#                         tbl_dispute_details = Tbl_dispute_details()
#                         tbl_dispute_details.__dict__.update(tbl_details_dict)
#                         session.add(tbl_dispute_details)

#                 session.commit()
                
#     return JsonResponse({"Success":True})

class tbl_reconcilation_process_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_reconcilation_process_mst_serializer
    queryset = tbl_reconcilation_process_mst.objects.filter(is_deleted='N')

# Schedule Batch
class tbl_schedule_process_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_schedule_process_mst_serializer
    queryset = tbl_schedule_process_mst.objects.filter(is_deleted='N')    

# Action- workflow
# class tbl_workflow_action_mst_view(viewsets.ModelViewSet):
#     serializer_class = tbl_workflow_action_mst_serializer
#     queryset = tbl_workflow_action_mst.objects.filter(is_deleted='N')

# Dispute Resolution

class tbl_role_mst_view(viewsets.ModelViewSet):
    serializer_class = tbl_role_mst_serializer
    queryset = Tbl_Role_Mst.objects.filter(is_deleted='N')

# get_dispute_source_data
@csrf_exempt
def get_dispute_source_data(request):
    # breakpoint()
    if request.method == "POST":
        tablesNames = json.loads(request.body)
        rowDataofSourceTables = []
        rowDataofDisputeTables = []

        for data in tablesNames['sourceTables']:
            selectQuery = "select count(*) from " + data
            cursor = connection.cursor()
            cursor.execute(selectQuery)
            row = cursor.fetchone()
            rowDataofSourceTables.append({data.replace('tbl_','').replace('_details',''): row})

        for data in tablesNames['disputeSourceTables'].keys():
            selectQuery = "select details_ref_id," + ",".join(tablesNames['disputeSourceTables'][data].values()) + " from " + data + " where overall_recon_status='Not Reconciled' limit 5"
            cursor = connection.cursor()
            cursor.execute(selectQuery)
            result = cursor.fetchall()
            rowDataofDisputeTables.append({data.replace('tbl_','').replace('_dispute_details',''): result})
            # breakpoint()

        return JsonResponse({"sourceResult": rowDataofSourceTables, "disputeSourceResult": rowDataofDisputeTables, "Success": True})    
