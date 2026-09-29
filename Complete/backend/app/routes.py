import os, uuid
from functools import wraps
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt
from werkzeug.utils import secure_filename
from . import db
from .models import User, Project, News, Gallery, SponsorEnquiry, SchoolSettings

api=Blueprint('api',__name__); ALLOWED={'jpg','jpeg','png','webp','jfif'}
def iso(dt): return dt.isoformat() if dt else None
def auth_admin(fn):
    @wraps(fn)
    @jwt_required()
    def w(*a,**k):
        if get_jwt().get('role')!='admin': return jsonify(error='Admin access required'),403
        return fn(*a,**k)
    return w
def file_url(name): return f'/api/uploads/{name}'
def save_image(file):
    if not file or not file.filename: raise ValueError('Image is required')
    ext=file.filename.rsplit('.',1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED: raise ValueError('Only JPG, PNG and WebP images are allowed')
    name=f'{uuid.uuid4().hex}.{ext}'; path=os.path.join(current_app.config['UPLOAD_FOLDER'],secure_filename(name)); file.save(path)
    return file_url(name)
def project_json(x): return {'id':x.id,'name':x.name,'category':x.category,'status':x.status,'target':x.target,'raised':x.raised,'description':x.description,'update':x.update,'image':x.image_url,'published':x.published,'created_at':iso(x.created_at)}
@api.post('/auth/login')
def login():
    data=request.get_json(silent=True) or {}; u=User.query.filter_by(email=str(data.get('email','')).lower().strip()).first()
    if not u or not u.active or not u.check_password(str(data.get('password',''))): return jsonify(error='Invalid email or password'),401
    return jsonify(access_token=create_access_token(identity=str(u.id),additional_claims={'role':u.role,'email':u.email}),user={'email':u.email,'role':u.role})
@api.get('/health')
def health(): return jsonify(status='ok',service='Cheptulel School API')
@api.get('/uploads/<path:name>')
def uploads(name): return send_from_directory(current_app.config['UPLOAD_FOLDER'],name)
@api.get('/public')
def public():
    projects=[project_json(x) for x in Project.query.filter_by(published=True).order_by(Project.created_at.desc()).all()]
    news=[{'id':x.id,'title':x.title,'category':x.category,'body':x.body,'created_at':iso(x.created_at)} for x in News.query.filter_by(published=True).order_by(News.created_at.desc()).limit(8)]
    gallery=[{'id':x.id,'title':x.title,'category':x.category,'caption':x.caption,'url':x.image_url,'created_at':iso(x.created_at)} for x in Gallery.query.filter_by(published=True).order_by(Gallery.created_at.desc()).limit(20)]
    s=SchoolSettings.query.first(); settings={'phone':s.phone if s else '','email':s.email if s else '','paybill':s.paybill if s else '','facebook':s.facebook if s else '','whatsapp':s.whatsapp if s else '','address':s.address if s else 'West Pokot County, Kenya'}
    return jsonify(projects=projects,news=news,gallery=gallery,settings=settings)
@api.post('/enquiries')
def enquiry():
    d=request.get_json(silent=True) or {}; required=['name','email','message']
    if any(not str(d.get(k,'')).strip() for k in required): return jsonify(error='Name, email and message are required'),400
    x=SponsorEnquiry(name=str(d['name']).strip()[:160],organization=str(d.get('organization','')).strip()[:200],email=str(d['email']).strip()[:255],phone=str(d.get('phone','')).strip()[:60],support_area=str(d.get('support_area','')).strip()[:160],message=str(d['message']).strip()[:5000]); db.session.add(x); db.session.commit(); return jsonify(message='Enquiry received'),201
@api.get('/admin/data')
@auth_admin
def admin_data():
    return jsonify(projects=[project_json(x) for x in Project.query.order_by(Project.created_at.desc())],news=[{'id':x.id,'title':x.title,'category':x.category,'body':x.body,'published':x.published,'created_at':iso(x.created_at)} for x in News.query.order_by(News.created_at.desc())],gallery=[{'id':x.id,'title':x.title,'category':x.category,'caption':x.caption,'url':x.image_url,'published':x.published,'created_at':iso(x.created_at)} for x in Gallery.query.order_by(Gallery.created_at.desc())],enquiries=[{'id':x.id,'name':x.name,'organization':x.organization,'email':x.email,'phone':x.phone,'support_area':x.support_area,'message':x.message,'status':x.status,'created_at':iso(x.created_at)} for x in SponsorEnquiry.query.order_by(SponsorEnquiry.created_at.desc())],settings=(lambda s:{'phone':s.phone,'email':s.email,'paybill':s.paybill,'facebook':s.facebook,'whatsapp':s.whatsapp,'address':s.address} if s else {}) (SchoolSettings.query.first()))
@api.post('/admin/projects')
@auth_admin
def add_project():
    d=request.form; x=Project(name=d.get('name','').strip(),category=d.get('category','Infrastructure'),status=d.get('status','Proposed'),target=float(d.get('target') or 0),raised=float(d.get('raised') or 0),description=d.get('description','').strip(),update=d.get('update','').strip(),published=d.get('published','true')=='true')
    if not x.name or not x.description: return jsonify(error='Project name and description are required'),400
    if request.files.get('image'): x.image_url=save_image(request.files['image'])
    db.session.add(x); db.session.commit(); return jsonify(project=project_json(x)),201
@api.delete('/admin/projects/<int:i>')
@auth_admin
def del_project(i):
    x=Project.query.get_or_404(i); db.session.delete(x); db.session.commit(); return jsonify(message='Deleted')
@api.post('/admin/news')
@auth_admin
def add_news():
    d=request.get_json(silent=True) or {}; x=News(title=str(d.get('title','')).strip(),category=str(d.get('category','School News')),body=str(d.get('body','')).strip(),published=bool(d.get('published',True)))
    if not x.title or not x.body:return jsonify(error='Title and body are required'),400
    db.session.add(x);db.session.commit();return jsonify(message='Published'),201
@api.delete('/admin/news/<int:i>')
@auth_admin
def del_news(i): x=News.query.get_or_404(i);db.session.delete(x);db.session.commit();return jsonify(message='Deleted')
@api.post('/admin/gallery')
@auth_admin
def add_gallery():
    d=request.form; x=Gallery(title=d.get('title','').strip(),category=d.get('category','School Life'),caption=d.get('caption','').strip(),published=d.get('published','false')=='true')
    if not x.title:return jsonify(error='Photo title is required'),400
    x.image_url=save_image(request.files.get('image'));db.session.add(x);db.session.commit();return jsonify(message='Uploaded'),201
@api.delete('/admin/gallery/<int:i>')
@auth_admin
def del_gallery(i): x=Gallery.query.get_or_404(i);db.session.delete(x);db.session.commit();return jsonify(message='Deleted')
@api.put('/admin/enquiries/<int:i>')
@auth_admin
def update_enquiry(i): x=SponsorEnquiry.query.get_or_404(i);x.status=(request.get_json(silent=True) or {}).get('status','new');db.session.commit();return jsonify(message='Updated')
@api.delete('/admin/enquiries/<int:i>')
@auth_admin
def del_enquiry(i): x=SponsorEnquiry.query.get_or_404(i);db.session.delete(x);db.session.commit();return jsonify(message='Deleted')
@api.put('/admin/settings')
@auth_admin
def settings():
    d=request.get_json(silent=True) or {};x=SchoolSettings.query.first() or SchoolSettings();
    for k in ['phone','email','paybill','facebook','whatsapp','address']:
        if k in d:setattr(x,k,str(d[k]).strip())
    db.session.add(x);db.session.commit();return jsonify(message='Settings saved')
