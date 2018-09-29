SELECT
	valid_shirt.*
FROM
	(SELECT
		*
	FROM
		shirt
	WHERE
		shirt.user_id = $1 AND (shirt.min_temp <= $2 OR shirt.min_temp IS NULL) AND (shirt.max_temp >= $2 OR shirt.max_temp IS NULL)
	) AS valid_shirt
INNER JOIN
	(SELECT
		joined_shirt.shirt_id
	FROM
		(SELECT
			DISTINCT shirt_pants_join.shirt_id, pants_outerwear_join.outerwear_id
		FROM
			shirt_pants_join
		INNER JOIN
			pants_outerwear_join
		ON
			shirt_pants_join.pants_id = pants_outerwear_join.pants_id
		INNER JOIN
			shirt_outerwear_join
		ON
			shirt_pants_join.shirt_id = shirt_outerwear_join.shirt_id AND pants_outerwear_join.outerwear_id = shirt_outerwear_join.outerwear_id
		WHERE
			pants_outerwear_join.outerwear_id = ANY($3)
		) AS joined_shirt
	GROUP BY
		joined_shirt.shirt_id
	HAVING
		COUNT(joined_shirt.shirt_id) = $4
	) AS possible_shirt
ON
	valid_shirt.id = possible_shirt.shirt_id