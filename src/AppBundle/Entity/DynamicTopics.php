<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * DynamicTopics
 *
 * @ORM\Table(name="Aux_Data.Dynamic_Topics", uniqueConstraints={@ORM\UniqueConstraint(name="Topic_ID_UNIQUE", columns={"Topic_ID"})})
 * @ORM\Entity
 */
class DynamicTopics
{
    /**
     * @var integer
     *
     * @ORM\Column(name="Topic_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     * @ORM\OneToMany(targetEntity="TopicParents", mappedBy="parentId")
     * @ORM\OneToMany(targetEntity="TopicParents", mappedBy="childId")
     * @ORM\OneToMany(targetEntity="TopicInterestAssociations", mappedBy="topicId")
     */
    private $topicId;

    /**
     * Constructor
     */
    public function __construct()
    {
    }

    /**
     * Get topicId
     *
     * @return integer
     */
    public function getTopicId()
    {
        return $this->topicId;
    }

}
