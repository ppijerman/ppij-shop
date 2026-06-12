\restrict dbmate

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: delivery_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.delivery_type AS ENUM (
    'PICKUP',
    'DELIVERY'
);


--
-- Name: order_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.order_status AS ENUM (
    'AWAITING_PAYMENT',
    'PAYMENT_REVIEW',
    'PROCESSING',
    'SHIPPED',
    'DONE',
    'CANCELLED'
);


--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method AS ENUM (
    'IBAN'
);


--
-- Name: product_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.product_category AS ENUM (
    'TSHIRT',
    'TOTEBAG'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'BUYER',
    'ADMIN_KK',
    'ADMIN_IT'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bundle_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bundle_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    bundle_id uuid NOT NULL
);


--
-- Name: bundles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bundles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    price numeric NOT NULL,
    original_price numeric,
    slug character varying(255) NOT NULL,
    "desc" text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sku character varying(100) NOT NULL,
    CONSTRAINT chk_bundle_original_price CHECK (((original_price IS NULL) OR (original_price >= price))),
    CONSTRAINT chk_bundle_price CHECK ((price >= (0)::numeric))
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid,
    user_id uuid NOT NULL,
    bundle_id uuid,
    quantity integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    selected_variant_ids uuid[] DEFAULT '{}'::uuid[],
    CONSTRAINT cart_items_exclusive_id CHECK ((((variant_id IS NOT NULL) AND (bundle_id IS NULL)) OR ((variant_id IS NULL) AND (bundle_id IS NOT NULL)))),
    CONSTRAINT chk_cart_item_qty CHECK ((quantity > 0))
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    variant_id uuid,
    bundle_id uuid,
    quantity integer NOT NULL,
    price_at_purchase numeric NOT NULL,
    product_name_snapshot character varying(255),
    sku_snapshot character varying(100),
    CONSTRAINT chk_order_item_qty CHECK ((quantity > 0)),
    CONSTRAINT order_items_exclusive_id CHECK ((((variant_id IS NOT NULL) AND (bundle_id IS NULL)) OR ((variant_id IS NULL) AND (bundle_id IS NOT NULL))))
);


--
-- Name: order_status_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    status public.order_status NOT NULL,
    note character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    changed_by_user_id uuid
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    status public.order_status NOT NULL,
    total_price numeric NOT NULL,
    delivery_address jsonb,
    delivery_type public.delivery_type NOT NULL,
    payment_proof_url character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    payment_method public.payment_method NOT NULL,
    shipping_tracking_number character varying(255),
    shipping_provider character varying(100),
    payment_proof_data bytea,
    payment_proof_content_type character varying(100),
    pickup_details text,
    payment_expires_at timestamp with time zone,
    shipping_cost numeric DEFAULT 0 NOT NULL,
    shipping_method_id text,
    sendcloud_parcel_id bigint,
    CONSTRAINT chk_delivery_address_logic CHECK (((delivery_type = 'PICKUP'::public.delivery_type) OR ((delivery_type = 'DELIVERY'::public.delivery_type) AND (delivery_address ? 'street'::text) AND (delivery_address ? 'city'::text) AND (delivery_address ? 'postcode'::text) AND (delivery_address ? 'country'::text)))),
    CONSTRAINT chk_order_total_price CHECK ((total_price >= (0)::numeric)),
    CONSTRAINT orders_payment_method_iban_only CHECK ((payment_method = 'IBAN'::public.payment_method))
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    url text,
    is_primary boolean DEFAULT false NOT NULL,
    data bytea,
    content_type text
);


--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    size character(10),
    stock integer NOT NULL,
    fit_type character varying(50) NOT NULL,
    price numeric NOT NULL,
    original_price numeric,
    sku character varying(100) NOT NULL,
    color_name character varying(100),
    color_hex character varying(7),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_fit_type CHECK (((fit_type)::text = ANY ((ARRAY['REGULAR'::character varying, 'OVERSIZED'::character varying])::text[]))),
    CONSTRAINT chk_original_price CHECK (((original_price IS NULL) OR (original_price >= price))),
    CONSTRAINT chk_price CHECK ((price >= (0)::numeric)),
    CONSTRAINT chk_stock CHECK ((stock >= 0))
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    subtitle character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    category public.product_category NOT NULL,
    "desc" text NOT NULL,
    tag character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    weight_g numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clerk_user_id text NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    email character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: bundle_items bundle_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT bundle_items_pkey PRIMARY KEY (id);


--
-- Name: bundles bundles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundles
    ADD CONSTRAINT bundles_pkey PRIMARY KEY (id);


--
-- Name: bundles bundles_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundles
    ADD CONSTRAINT bundles_sku_key UNIQUE (sku);


--
-- Name: bundles bundles_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundles
    ADD CONSTRAINT bundles_slug_key UNIQUE (slug);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_logs order_status_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT order_status_logs_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);


--
-- Name: product_variants product_variants_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: bundle_items uq_bundle_variant; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT uq_bundle_variant UNIQUE (bundle_id, variant_id);


--
-- Name: users uq_users_clerk_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_clerk_id UNIQUE (clerk_user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_bundle_items_bundle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bundle_items_bundle_id ON public.bundle_items USING btree (bundle_id);


--
-- Name: idx_bundle_items_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bundle_items_variant_id ON public.bundle_items USING btree (variant_id);


--
-- Name: idx_bundles_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bundles_slug ON public.bundles USING btree (slug);


--
-- Name: idx_cart_items_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_items_user_id ON public.cart_items USING btree (user_id);


--
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- Name: idx_order_status_logs_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_logs_order_id ON public.order_status_logs USING btree (order_id);


--
-- Name: idx_orders_awaiting_payment_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_awaiting_payment_expires_at ON public.orders USING btree (payment_expires_at) WHERE (status = 'AWAITING_PAYMENT'::public.order_status);


--
-- Name: idx_orders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


--
-- Name: idx_product_images_only_one_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_product_images_only_one_primary ON public.product_images USING btree (product_id) WHERE (is_primary = true);


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: idx_product_variants_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);


--
-- Name: idx_products_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_slug ON public.products USING btree (slug);


--
-- Name: idx_unique_cart_bundle; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_unique_cart_bundle ON public.cart_items USING btree (user_id, bundle_id);


--
-- Name: idx_unique_cart_variant; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_unique_cart_variant ON public.cart_items USING btree (user_id, variant_id) WHERE (variant_id IS NOT NULL);


--
-- Name: idx_users_clerk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_clerk_id ON public.users USING btree (clerk_user_id);


--
-- Name: oders_sendcloud_parcel_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX oders_sendcloud_parcel_id_idx ON public.orders USING btree (sendcloud_parcel_id) WHERE (sendcloud_parcel_id IS NOT NULL);


--
-- Name: bundles set_timestamp_bundles; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_bundles BEFORE UPDATE ON public.bundles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cart_items set_timestamp_cart_items; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_cart_items BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: orders set_timestamp_orders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: product_variants set_timestamp_product_variants; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_product_variants BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products set_timestamp_products; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users set_timestamp_users; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bundle_items fk_bundle_items_bundle; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT fk_bundle_items_bundle FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;


--
-- Name: bundle_items fk_bundle_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bundle_items
    ADD CONSTRAINT fk_bundle_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_bundle; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_bundle FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart_items fk_cart_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk_cart_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_bundle; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_bundle FOREIGN KEY (bundle_id) REFERENCES public.bundles(id) ON DELETE RESTRICT;


--
-- Name: order_items fk_order_items_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order_items_variant FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE RESTRICT;


--
-- Name: orders fk_orders_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: product_images fk_product_images_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: order_status_logs fk_status_logs_changed_by_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT fk_status_logs_changed_by_user FOREIGN KEY (changed_by_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: order_status_logs fk_status_logs_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_logs
    ADD CONSTRAINT fk_status_logs_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: product_variants fk_variants_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict dbmate


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20260518190445'),
    ('20260520002041'),
    ('20260526233645'),
    ('20260527000100'),
    ('20260531012302'),
    ('20260602154031'),
    ('20260606000100'),
    ('20260608000100'),
    ('20260611163147'),
    ('20260612011146');
