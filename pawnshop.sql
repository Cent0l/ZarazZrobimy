PGDMP                       }            pawnshop_db    17.4    17.4 I    }           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            ~           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    16388    pawnshop_db    DATABASE     q   CREATE DATABASE pawnshop_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'pl-PL';
    DROP DATABASE pawnshop_db;
                     postgres    false            �            1255    16532    update_modified_column()    FUNCTION     �   CREATE FUNCTION public.update_modified_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;
 /   DROP FUNCTION public.update_modified_column();
       public               postgres    false            �            1259    16473    item_history    TABLE     �   CREATE TABLE public.item_history (
    id integer NOT NULL,
    item_id integer,
    user_id integer,
    action character varying(50),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE public.item_history;
       public         heap r       postgres    false            �            1259    16472    item_history_id_seq    SEQUENCE     �   CREATE SEQUENCE public.item_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.item_history_id_seq;
       public               postgres    false    226            �           0    0    item_history_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.item_history_id_seq OWNED BY public.item_history.id;
          public               postgres    false    225            �            1259    16455    item_images    TABLE     �   CREATE TABLE public.item_images (
    id integer NOT NULL,
    item_id integer,
    url character varying(255),
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.item_images;
       public         heap r       postgres    false            �            1259    16454    item_images_id_seq    SEQUENCE     �   CREATE SEQUENCE public.item_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.item_images_id_seq;
       public               postgres    false    224            �           0    0    item_images_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.item_images_id_seq OWNED BY public.item_images.id;
          public               postgres    false    223            �            1259    16443    items    TABLE     �  CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(255),
    description text,
    price numeric(10,2),
    condition integer,
    status character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT items_condition_check CHECK (((condition >= 1) AND (condition <= 10)))
);
    DROP TABLE public.items;
       public         heap r       postgres    false            �            1259    16442    items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.items_id_seq;
       public               postgres    false    222            �           0    0    items_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;
          public               postgres    false    221            �            1259    16491    notifications    TABLE     �   CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 !   DROP TABLE public.notifications;
       public         heap r       postgres    false            �            1259    16490    notifications_id_seq    SEQUENCE     �   CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.notifications_id_seq;
       public               postgres    false    228            �           0    0    notifications_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;
          public               postgres    false    227            �            1259    16507    reports    TABLE     �   CREATE TABLE public.reports (
    id integer NOT NULL,
    user_id integer,
    type character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    file_path character varying(255)
);
    DROP TABLE public.reports;
       public         heap r       postgres    false            �            1259    16506    reports_id_seq    SEQUENCE     �   CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.reports_id_seq;
       public               postgres    false    230            �           0    0    reports_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;
          public               postgres    false    229            �            1259    16416    roles    TABLE     X   CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255)
);
    DROP TABLE public.roles;
       public         heap r       postgres    false            �            1259    16415    roles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.roles_id_seq;
       public               postgres    false    218            �           0    0    roles_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;
          public               postgres    false    217            �            1259    16520    sessions    TABLE     �   CREATE TABLE public.sessions (
    id integer NOT NULL,
    user_id integer,
    token character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone
);
    DROP TABLE public.sessions;
       public         heap r       postgres    false            �            1259    16519    sessions_id_seq    SEQUENCE     �   CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.sessions_id_seq;
       public               postgres    false    232            �           0    0    sessions_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;
          public               postgres    false    231            �            1259    16425    users    TABLE     �   CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255),
    password_hash character varying(255),
    email character varying(255),
    role_id integer
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16424    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    220            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    219            �           2604    16476    item_history id    DEFAULT     r   ALTER TABLE ONLY public.item_history ALTER COLUMN id SET DEFAULT nextval('public.item_history_id_seq'::regclass);
 >   ALTER TABLE public.item_history ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    225    226    226            �           2604    16458    item_images id    DEFAULT     p   ALTER TABLE ONLY public.item_images ALTER COLUMN id SET DEFAULT nextval('public.item_images_id_seq'::regclass);
 =   ALTER TABLE public.item_images ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    16446    items id    DEFAULT     d   ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);
 7   ALTER TABLE public.items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    16494    notifications id    DEFAULT     t   ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);
 ?   ALTER TABLE public.notifications ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    227    228            �           2604    16510 
   reports id    DEFAULT     h   ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);
 9   ALTER TABLE public.reports ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    230    230            �           2604    16419    roles id    DEFAULT     d   ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);
 7   ALTER TABLE public.roles ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    16523    sessions id    DEFAULT     j   ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);
 :   ALTER TABLE public.sessions ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    232    231    232            �           2604    16428    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    220    220            t          0    16473    item_history 
   TABLE DATA           Q   COPY public.item_history (id, item_id, user_id, action, "timestamp") FROM stdin;
    public               postgres    false    226   5U       r          0    16455    item_images 
   TABLE DATA           Q   COPY public.item_images (id, item_id, url, uploaded_by, uploaded_at) FROM stdin;
    public               postgres    false    224   RU       p          0    16443    items 
   TABLE DATA           h   COPY public.items (id, name, description, price, condition, status, created_at, updated_at) FROM stdin;
    public               postgres    false    222   oU       v          0    16491    notifications 
   TABLE DATA           R   COPY public.notifications (id, user_id, message, is_read, created_at) FROM stdin;
    public               postgres    false    228   �U       x          0    16507    reports 
   TABLE DATA           K   COPY public.reports (id, user_id, type, created_at, file_path) FROM stdin;
    public               postgres    false    230   �U       l          0    16416    roles 
   TABLE DATA           )   COPY public.roles (id, name) FROM stdin;
    public               postgres    false    218   �U       z          0    16520    sessions 
   TABLE DATA           N   COPY public.sessions (id, user_id, token, created_at, expires_at) FROM stdin;
    public               postgres    false    232   �U       n          0    16425    users 
   TABLE DATA           L   COPY public.users (id, username, password_hash, email, role_id) FROM stdin;
    public               postgres    false    220    V       �           0    0    item_history_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.item_history_id_seq', 1, false);
          public               postgres    false    225            �           0    0    item_images_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.item_images_id_seq', 1, false);
          public               postgres    false    223            �           0    0    items_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.items_id_seq', 1, false);
          public               postgres    false    221            �           0    0    notifications_id_seq    SEQUENCE SET     C   SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);
          public               postgres    false    227            �           0    0    reports_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.reports_id_seq', 1, false);
          public               postgres    false    229            �           0    0    roles_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.roles_id_seq', 7, true);
          public               postgres    false    217            �           0    0    sessions_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.sessions_id_seq', 1, false);
          public               postgres    false    231            �           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 1, false);
          public               postgres    false    219            �           2606    16479    item_history item_history_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.item_history
    ADD CONSTRAINT item_history_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.item_history DROP CONSTRAINT item_history_pkey;
       public                 postgres    false    226            �           2606    16461    item_images item_images_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.item_images
    ADD CONSTRAINT item_images_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.item_images DROP CONSTRAINT item_images_pkey;
       public                 postgres    false    224            �           2606    16453    items items_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.items DROP CONSTRAINT items_pkey;
       public                 postgres    false    222            �           2606    16500     notifications notifications_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
       public                 postgres    false    228            �           2606    16513    reports reports_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.reports DROP CONSTRAINT reports_pkey;
       public                 postgres    false    230            �           2606    16423    roles roles_name_key 
   CONSTRAINT     O   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);
 >   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_name_key;
       public                 postgres    false    218            �           2606    16421    roles roles_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.roles DROP CONSTRAINT roles_pkey;
       public                 postgres    false    218            �           2606    16526    sessions sessions_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_pkey;
       public                 postgres    false    232            �           2606    16436    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    220            �           2606    16432    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    220            �           2606    16434    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    220            �           2620    16533    items update_items_modtime    TRIGGER     �   CREATE TRIGGER update_items_modtime BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
 3   DROP TRIGGER update_items_modtime ON public.items;
       public               postgres    false    222    233            �           2606    16480 &   item_history item_history_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.item_history
    ADD CONSTRAINT item_history_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);
 P   ALTER TABLE ONLY public.item_history DROP CONSTRAINT item_history_item_id_fkey;
       public               postgres    false    226    222    4806            �           2606    16485 &   item_history item_history_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.item_history
    ADD CONSTRAINT item_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 P   ALTER TABLE ONLY public.item_history DROP CONSTRAINT item_history_user_id_fkey;
       public               postgres    false    226    220    4802            �           2606    16462 $   item_images item_images_item_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.item_images
    ADD CONSTRAINT item_images_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE CASCADE;
 N   ALTER TABLE ONLY public.item_images DROP CONSTRAINT item_images_item_id_fkey;
       public               postgres    false    4806    224    222            �           2606    16467 (   item_images item_images_uploaded_by_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.item_images
    ADD CONSTRAINT item_images_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);
 R   ALTER TABLE ONLY public.item_images DROP CONSTRAINT item_images_uploaded_by_fkey;
       public               postgres    false    4802    224    220            �           2606    16501 (   notifications notifications_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 R   ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_user_id_fkey;
       public               postgres    false    4802    220    228            �           2606    16514    reports reports_user_id_fkey    FK CONSTRAINT     {   ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 F   ALTER TABLE ONLY public.reports DROP CONSTRAINT reports_user_id_fkey;
       public               postgres    false    4802    230    220            �           2606    16527    sessions sessions_user_id_fkey    FK CONSTRAINT     }   ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
 H   ALTER TABLE ONLY public.sessions DROP CONSTRAINT sessions_user_id_fkey;
       public               postgres    false    220    4802    232            �           2606    16437    users users_role_id_fkey    FK CONSTRAINT     w   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_role_id_fkey;
       public               postgres    false    4798    218    220            t      x������ � �      r      x������ � �      p      x������ � �      v      x������ � �      x      x������ � �      l      x������ � �      z      x������ � �      n      x������ � �     