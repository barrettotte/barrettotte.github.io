all:	build

build:
	hugo -D

serve:
	hugo server --disableFastRender --noHTTPCache