<?php
/**
 * Plugin Name: Chippr marketing rails
 * Description: Per-rail control for posts created by the marketing publisher (WordPress user "marketing-bot"). X is OMITTED from the pipeline for now (chippr-bots#169): twitter-auto-publish must not fire for those posts. LinkedIn auto-publish is left in place — it is the pipeline's delegated LinkedIn rail. Human-authored posts are untouched. Source of truth: chippr-bots repo, infra/wordpress/mu-plugins/ — deploy per docs/runbooks/marketing-secrets.md.
 */
add_action( 'transition_post_status', function ( $new_status, $old_status, $post ) {
	if ( ! ( $post instanceof WP_Post ) || 'publish' !== $new_status ) {
		return;
	}
	$author = get_userdata( (int) $post->post_author );
	if ( ! $author || 'marketing-bot' !== $author->user_login ) {
		return;
	}
	// twitter-auto-publish hooks transition_post_status at priority 10; this runs at 9 and
	// unhooks it for the current request only (one REST create = one post).
	remove_action( 'transition_post_status', 'xyz_link_twap_future_to_publish', 10 );
}, 9, 3 );
