SELECT
	valid_dress.*
FROM
	(SELECT
		*
	FROM
		dress
	WHERE
		dress.user_id = $1 AND (dress.min_temp <= $2 OR dress.min_temp IS NULL) AND (dress.max_temp >= $2 OR dress.max_temp IS NULL)
	) AS valid_dress
INNER JOIN
	(SELECT
		joined_dress.dress_id
	FROM 
		(SELECT
			DISTINCT dress_id, outerwear_id
		FROM
			dress_outerwear_join
		WHERE
			outerwear_id = ANY($3)
		) AS joined_dress
	GROUP BY
		joined_dress.dress_id
	HAVING
		COUNT(joined_dress.dress_id) = $4
	) AS possible_dress
ON
	valid_dress.id = possible_dress.dress_id