SELECT
	valid_outerwear.*
FROM
	(SELECT
		*
	FROM
		outerwear
	WHERE
		outerwear.specific_kind = 'raincoat' AND outerwear.user_id = $1 AND (outerwear.min_temp <= $2 OR outerwear.min_temp IS NULL) AND (outerwear.max_temp >= $2 OR outerwear.max_temp IS NULL)
	) AS valid_outerwear
INNER JOIN
	(SELECT
		COALESCE(shirt_pants_joined_outerwear.outerwear_id, dress_joined_outerwear.outerwear_id) AS outerwear_id
	FROM
		(SELECT
			DISTINCT shirt_outerwear_join.outerwear_id
		FROM
			shirt_outerwear_join
		FULL OUTER JOIN
			pants_outerwear_join
		ON
			shirt_outerwear_join.outerwear_id = pants_outerwear_join.outerwear_id
		INNER JOIN
			shirt_pants_join
		ON
			shirt_outerwear_join.shirt_id = shirt_pants_join.shirt_id AND pants_outerwear_join.pants_id = shirt_pants_join.pants_id
		) AS shirt_pants_joined_outerwear
	FULL OUTER JOIN
		(SELECT
			DISTINCT outerwear_id
		FROM
			dress_outerwear_join
		) AS dress_joined_outerwear
	ON
		shirt_pants_joined_outerwear.outerwear_id = dress_joined_outerwear.outerwear_id
	) AS joined_outerwear
ON
	valid_outerwear.id = joined_outerwear.outerwear_id